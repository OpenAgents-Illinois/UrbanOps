# UrbanOps — Smart City Operations Platform

## Overview
Real-time city operations platform unifying traffic, transit, incidents, and weather into a single live map. Detects disruptions, predicts impact, and recommends actions.

## Learnings

This project maintains a `learnings.md` file at the project root. Add entries whenever you:
- Fix a non-obvious bug (include root cause)
- Discover a library/API gotcha or version-specific quirk
- Make an architectural decision worth remembering
- Find a useful command, config, or file path that wasn't obvious

Use the `/capture-learnings` skill at the end of sessions to do this automatically.

## Memory

This project maintains a `memory.md` file at the project root. Use it to store persistent context that should survive across sessions:
- Current state of the codebase (what's built, what's in progress)
- Key architectural decisions and the reasoning behind them
- Patterns and conventions established for this project
- Gotchas, known issues, and workarounds

Update `memory.md` whenever something significant changes. Read it at the start of each session before doing anything else.

## Completed Work

### 2026-03-27 — Initial Implementation (all 12 tasks)
- Built event-driven microservices architecture: Simulator, Stream Processor, LLM Analyst + Next.js frontend
- Simulator generates realistic Chicago traffic, transit, incident, and weather data on configurable intervals
- Stream Processor maintains in-memory city state, broadcasts via WebSocket, serves REST snapshots
- LLM Analyst calls Claude API for incident recommendations (severity-gated, context-aware)
- Frontend: dark-themed dashboard with Mapbox GL 3D map, layer toggles, live event feed, AI recommendation panel, stats bar
- Docker Compose orchestrates Redis + all services with healthchecks and dev volumes
- Key conventions: shared Pydantic schemas in `services/shared/`, [lat, lng] in backend → [lng, lat] for Mapbox
