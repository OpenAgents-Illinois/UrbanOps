import asyncio
import json
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import redis.asyncio as aioredis
from fastapi import FastAPI

from config import (
    OPENAI_API_KEY,
    MIN_SEVERITY,
    MODEL,
    REDIS_URL,
    SEVERITY_ORDER,
)
from fastapi.middleware.cors import CORSMiddleware
from prompts import SYSTEM_PROMPT, PLAN_PROMPT

try:
    from shared.schemas import (
        ActionType,
        IncidentEvent,
        RecommendationAction,
        RecommendationEvent,
        Severity,
    )
except ImportError:
    import sys, os  # noqa: E401
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from shared.schemas import (
        ActionType,
        IncidentEvent,
        RecommendationAction,
        RecommendationEvent,
        Severity,
    )

logger = logging.getLogger("analyst")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

EVENTS_CHANNEL = "city.events"
RECS_CHANNEL = "city.recommendations"

redis_client: aioredis.Redis | None = None
openai_client = None  # type: ignore[assignment]

# Rolling context windows so the LLM has recent situational awareness.
recent_traffic: dict | None = None
recent_weather: dict | None = None


def severity_meets_threshold(severity: str) -> bool:
    """Return True if *severity* is at or above MIN_SEVERITY."""
    try:
        return SEVERITY_ORDER.index(severity) >= SEVERITY_ORDER.index(MIN_SEVERITY)
    except ValueError:
        return False


def build_user_prompt(incident: dict, context: dict) -> str:
    """Build the per-incident user message sent to the LLM."""
    parts = [
        "NEW INCIDENT:",
        json.dumps(incident, indent=2, default=str),
    ]
    if context.get("weather"):
        parts.append("\nCURRENT WEATHER:")
        parts.append(json.dumps(context["weather"], indent=2, default=str))
    if context.get("traffic"):
        parts.append("\nRECENT TRAFFIC:")
        parts.append(json.dumps(context["traffic"], indent=2, default=str))
    return "\n".join(parts)


def analyze_incident_sync(incident: dict, context: dict) -> dict | None:
    """Call OpenAI synchronously (designed to run in a thread via asyncio.to_thread)."""
    if openai_client is None:
        logger.warning("OpenAI client not configured; skipping analysis")
        return None

    user_prompt = build_user_prompt(incident, context)

    try:
        response = openai_client.chat.completions.create(
            model=MODEL,
            max_completion_tokens=4096,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
        msg = response.choices[0].message
        logger.info("GPT-5 response: content=%r, refusal=%r, finish=%s",
                     (msg.content or "")[:200], getattr(msg, 'refusal', None), response.choices[0].finish_reason)
        raw = msg.content or ""
        # Strip markdown fences if present
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()
        data = json.loads(raw)
    except Exception:
        logger.exception("OpenAI API call or JSON parse failed")
        return None

    # Validate and build the recommendation event.
    try:
        actions = []
        for a in data.get("actions", []):
            # affected_area may come as string (GPT) or coordinates — only keep if valid list
            area = a.get("affected_area")
            if not isinstance(area, list):
                area = None
            actions.append(
                RecommendationAction(
                    action=ActionType(a["action"]),
                    description=a["description"],
                    priority=Severity(a.get("priority", "medium")),
                    affected_area=area,
                )
            )

        rec = RecommendationEvent(
            type="recommendation",
            id=str(uuid.uuid4()),
            incident_id=incident.get("id", "unknown"),
            timestamp=datetime.now(timezone.utc),
            actions=actions,
            summary=data.get("summary", ""),
            confidence=float(data.get("confidence", 0.5)),
        )
        return json.loads(rec.model_dump_json())
    except Exception:
        logger.exception("Failed to build RecommendationEvent from LLM output")
        return None


async def incident_listener():
    """Subscribe to city events, analyse incidents, publish recommendations."""
    global recent_traffic, recent_weather

    if redis_client is None:
        logger.error("Redis not available; listener exiting")
        return

    pubsub = redis_client.pubsub()
    await pubsub.subscribe(EVENTS_CHANNEL)
    logger.info("Subscribed to %s", EVENTS_CHANNEL)

    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue

            try:
                payload = json.loads(message["data"])
            except (json.JSONDecodeError, TypeError):
                continue

            event_type = payload.get("type")

            # Keep rolling context for the LLM.
            if event_type == "traffic":
                recent_traffic = payload
                continue
            if event_type == "weather":
                recent_weather = payload
                continue
            if event_type != "incident":
                continue

            # Filter by severity threshold.
            severity = payload.get("severity", "low")
            if not severity_meets_threshold(severity):
                logger.debug("Skipping %s-severity incident %s", severity, payload.get("id"))
                continue

            logger.info(
                "Analysing incident %s (%s, %s)",
                payload.get("id"),
                payload.get("category"),
                severity,
            )

            context = {
                "weather": recent_weather,
                "traffic": recent_traffic,
            }

            rec = await asyncio.to_thread(analyze_incident_sync, payload, context)

            if rec and redis_client:
                await redis_client.publish(RECS_CHANNEL, json.dumps(rec, default=str))
                logger.info("Published recommendation %s for incident %s", rec["id"], rec["incident_id"])
    except asyncio.CancelledError:
        pass
    finally:
        await pubsub.unsubscribe(EVENTS_CHANNEL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, openai_client

    redis_client = aioredis.from_url(REDIS_URL)

    if OPENAI_API_KEY:
        from openai import OpenAI

        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("OpenAI client initialised (model=%s)", MODEL)
    else:
        logger.warning("OPENAI_API_KEY not set; LLM analysis disabled")

    listener_task = asyncio.create_task(incident_listener())
    yield
    listener_task.cancel()
    if redis_client:
        await redis_client.aclose()


app = FastAPI(title="UrbanOps Analyst", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_plan_sync(incident: dict) -> dict | None:
    """Generate a detailed response plan for an incident."""
    if openai_client is None:
        return None

    context_parts = []
    if recent_weather:
        w = recent_weather.get("conditions", {})
        context_parts.append(f"Weather: {w.get('temperature_f')}°F, {w.get('precipitation')}, wind {w.get('wind_speed_mph')}mph, visibility {w.get('visibility_miles')}mi")
        if w.get("alert"):
            context_parts.append(f"ACTIVE ALERT: {w['alert']}")
    if recent_traffic:
        severe = [s for s in recent_traffic.get("segments", []) if s.get("congestion_level") in ("severe", "heavy")]
        if severe:
            context_parts.append(f"Congested corridors: {', '.join(s['road'] for s in severe[:6])}")

    user_msg = f"""INCIDENT REQUIRING DETAILED RESPONSE PLAN:

{json.dumps(incident, indent=2, default=str)}

CURRENT CONDITIONS:
{chr(10).join(context_parts) if context_parts else 'No additional context.'}

Generate a comprehensive, phased response plan."""

    try:
        response = openai_client.chat.completions.create(
            model=MODEL,
            max_completion_tokens=4096,
            messages=[
                {"role": "system", "content": PLAN_PROMPT},
                {"role": "user", "content": user_msg},
            ],
        )
        raw = response.choices[0].message.content or ""
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()
        return json.loads(raw)
    except Exception:
        logger.exception("Plan generation failed")
        return None


@app.get("/health")
async def health():
    return {
        "service": "analyst",
        "status": "ok",
        "llm_configured": openai_client is not None,
    }


@app.post("/api/plan")
async def create_plan(incident: dict):
    """Generate a detailed response plan for a specific incident."""
    plan = await asyncio.to_thread(generate_plan_sync, incident)
    if plan is None:
        return {"error": "Plan generation failed"}, 500
    return plan
