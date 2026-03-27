# UrbanOps — Smart City Operations Platform Design

**Date:** 2026-03-27
**Goal:** Portfolio/demo project — visual impact + technical depth
**City:** Chicago (real geography + open data)

---

## Architecture: Event-Driven Microservices

Four services communicating via Redis Pub/Sub, orchestrated with Docker Compose.

```
Frontend (Next.js) ← WebSocket ← Stream Processor ← Redis Pub/Sub ← Simulator
                                                   ← Redis Pub/Sub ← LLM Analyst
```

### Services

1. **Simulator** (FastAPI) — Generates realistic Chicago city events on configurable intervals, publishes to Redis channel `city.events`
2. **Stream Processor** (FastAPI) — Subscribes to all Redis channels, maintains current city state in memory, serves WebSocket connections to frontend and REST endpoints for snapshots
3. **LLM Analyst** (FastAPI) — Subscribes to high-severity incidents from `city.events`, calls Claude API to generate actionable recommendations, publishes to `city.recommendations`
4. **Frontend** (Next.js) — Mapbox GL JS map centered on Chicago with 4 data layers, connects to Stream Processor via WebSocket

### Message Broker

Redis Pub/Sub — lightweight, fire-and-forget (acceptable since data is simulated).

**Channels:**
- `city.events` — all simulator-generated events
- `city.recommendations` — LLM analyst recommendations

---

## Data Layers & Event Schemas

### Traffic Flow (every 2s)
```json
{
  "type": "traffic",
  "timestamp": "ISO8601",
  "segments": [
    {
      "road": "string",
      "from": [lat, lng],
      "to": [lat, lng],
      "speed_mph": number,
      "free_flow_mph": number,
      "congestion_level": "free | light | moderate | heavy | severe"
    }
  ]
}
```

### Transit Vehicles (every 5s)
```json
{
  "type": "transit",
  "timestamp": "ISO8601",
  "vehicles": [
    {
      "id": "string",
      "route": "string",
      "mode": "bus | train",
      "position": [lat, lng],
      "heading": number,
      "speed_mph": number,
      "delay_minutes": number,
      "status": "on_time | delayed | stopped"
    }
  ]
}
```

### Incidents (on occurrence)
```json
{
  "type": "incident",
  "id": "string",
  "timestamp": "ISO8601",
  "category": "accident | road_closure | fire | police | construction",
  "severity": "low | medium | high | critical",
  "position": [lat, lng],
  "description": "string",
  "affected_roads": ["string"],
  "status": "active | responding | resolved",
  "estimated_clearance": "ISO8601"
}
```

### Weather (every 60s)
```json
{
  "type": "weather",
  "timestamp": "ISO8601",
  "conditions": {
    "temperature_f": number,
    "wind_speed_mph": number,
    "wind_direction": "string",
    "precipitation": "none | rain | snow | sleet | fog",
    "visibility_miles": number,
    "alert": "string | null"
  }
}
```

### LLM Recommendations (after analysis)
```json
{
  "type": "recommendation",
  "id": "string",
  "incident_id": "string",
  "timestamp": "ISO8601",
  "actions": [
    {
      "action": "reroute_traffic | dispatch_crew | close_road | issue_alert",
      "description": "string",
      "priority": "low | medium | high | critical",
      "affected_area": [[lat, lng], [lat, lng]]
    }
  ],
  "summary": "string",
  "confidence": number
}
```

---

## Frontend UI

### Layout
- **Top bar:** Logo, layer toggle buttons (Traffic/Transit/Incidents/Weather), city name
- **Map (70%):** Mapbox GL JS, dark style, 3D buildings, centered on Chicago
- **Right panel (30%):** Split — Live Feed (scrolling timeline) + AI Analyst (recommendations with Apply/Skip)
- **Stats bar (bottom):** Active incidents, avg speed, bus on-time %, temp, system health

### Map Layers
- **Traffic:** Color-coded road segments (green → red by congestion)
- **Transit:** Animated bus/train icons along routes, color by delay
- **Incidents:** Pulsing markers sized by severity
- **Weather:** Semi-transparent overlay (snow/rain/fog effects)

### Interactions
- Click incident → zoom + detail popover + AI panel
- Toggle layers → smooth fade
- "Apply" recommendation → animated reroute path on map
- Hover road → speed/congestion tooltip

---

## Project Structure

```
urbanops/
├── docker-compose.yml
├── .env.example
├── services/
│   ├── simulator/       # FastAPI — event generators
│   ├── processor/       # FastAPI — WebSocket hub + REST + state
│   └── analyst/         # FastAPI — Claude API integration
├── frontend/            # Next.js + Mapbox GL + Tailwind
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
└── docs/plans/
```

### Key Dependencies
| Service | Packages |
|---------|----------|
| Simulator | fastapi, uvicorn, redis, faker |
| Processor | fastapi, uvicorn, redis, websockets |
| Analyst | fastapi, uvicorn, redis, anthropic |
| Frontend | next, react, mapbox-gl, tailwindcss |
| Infra | docker, docker-compose, redis:alpine |

---

## Tech Decisions Log
- **Redis Pub/Sub over Kafka/RabbitMQ:** Simplicity for demo scope; fire-and-forget acceptable with simulated data
- **Separate Analyst service:** Isolates LLM latency from real-time event path
- **Mapbox GL JS over Deck.gl/Leaflet:** Best balance of visual polish, 3D support, and portfolio impact
- **Chicago over SF/NYC:** Good open data, grid layout clean for traffic viz, recognizable geography
