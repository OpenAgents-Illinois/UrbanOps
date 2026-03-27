import random
import uuid
from datetime import datetime, timedelta, timezone

from shared.schemas import IncidentCategory, IncidentEvent, IncidentStatus, Severity
from config import CHICAGO_BOUNDS, CHICAGO_ROADS

_DESCRIPTIONS = {
    IncidentCategory.ACCIDENT: [
        "Multi-vehicle collision",
        "Rear-end collision at intersection",
        "Vehicle struck pedestrian",
        "Single vehicle rollover",
    ],
    IncidentCategory.ROAD_CLOSURE: [
        "Water main break",
        "Sinkhole reported",
        "Downed power lines",
        "Emergency road repair",
    ],
    IncidentCategory.FIRE: [
        "Structure fire reported",
        "Vehicle fire on roadway",
        "Electrical fire near intersection",
    ],
    IncidentCategory.POLICE: [
        "Police activity — area blocked",
        "Active investigation in progress",
        "Crowd control operation",
    ],
    IncidentCategory.CONSTRUCTION: [
        "Lane closure for road resurfacing",
        "Utility work — expect delays",
        "Bridge maintenance in progress",
    ],
}


def maybe_generate_incident() -> IncidentEvent | None:
    if random.random() > 0.20:
        return None

    category = random.choice(list(IncidentCategory))
    severity = random.choices(list(Severity), weights=[40, 30, 20, 10])[0]

    if random.random() < 0.7 and CHICAGO_ROADS:
        road = random.choice(CHICAGO_ROADS)
        t = random.random()
        lat = road["from"][0] + (road["to"][0] - road["from"][0]) * t
        lng = road["from"][1] + (road["to"][1] - road["from"][1]) * t
        affected = [road["road"]]
    else:
        lat = random.uniform(CHICAGO_BOUNDS["south"], CHICAGO_BOUNDS["north"])
        lng = random.uniform(CHICAGO_BOUNDS["west"], CHICAGO_BOUNDS["east"])
        affected = []

    lat += random.gauss(0, 0.002)
    lng += random.gauss(0, 0.002)

    now = datetime.now(timezone.utc)
    road_suffix = f" on {affected[0]}" if affected else ""

    return IncidentEvent(
        id=f"inc-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}",
        timestamp=now,
        category=category,
        severity=severity,
        position=[round(lat, 6), round(lng, 6)],
        description=random.choice(_DESCRIPTIONS[category]) + road_suffix,
        affected_roads=affected,
        status=IncidentStatus.ACTIVE,
        estimated_clearance=now + timedelta(minutes=random.randint(15, 120)),
    )
