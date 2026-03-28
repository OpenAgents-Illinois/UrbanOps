# Memory

## Current State (2026-03-27)
- **Phase:** All 12 tasks complete — full stack implemented and building clean
- **Design doc:** `docs/plans/2026-03-27-urbanops-design.md`
- **Implementation plan:** `docs/plans/2026-03-27-urbanops-implementation.md`
- **Architecture:** Event-driven microservices (Simulator, Processor, Analyst, Frontend) + Redis Pub/Sub
- **Stack:** FastAPI (Python 3.11) backend, Next.js 16 + React + Mapbox GL JS frontend, Claude API for LLM analyst
- **City:** Chicago with real geography (14 roads, 6 bus routes, 4 L-train lines)
- **Goal:** Portfolio/demo project — visual impact + technical depth

## What's Built
- **Simulator service** — 4 data generators (traffic, transit, incidents, weather) publishing to Redis
- **Processor service** — WebSocket hub + REST API, maintains in-memory city state
- **Analyst service** — Subscribes to incidents, calls Claude API, publishes recommendations
- **Frontend** — Dark-themed dashboard with Mapbox 3D map, layer toggles, live feed, AI analyst panel, stats bar
- **Docker Compose** — Full stack orchestration (Redis + 3 Python services + Next.js)

## Next Steps
- Add real `.env` with MAPBOX_TOKEN and ANTHROPIC_API_KEY
- Run `docker compose up` for full integration test
- Consider adding: incident resolution flow, reroute animation on map, historical data view
