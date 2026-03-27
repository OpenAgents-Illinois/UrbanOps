import random
from datetime import datetime, timezone

from shared.schemas import TransitEvent, TransitMode, TransitStatus, TransitVehicle
from config import CTA_BUS_ROUTES, CTA_TRAIN_LINES


def _interpolate(stops: list[list[float]], progress: float) -> list[float]:
    n = len(stops) - 1
    idx = min(int(progress * n), n - 1)
    local_t = (progress * n) - idx
    lat = stops[idx][0] + (stops[idx + 1][0] - stops[idx][0]) * local_t
    lng = stops[idx][1] + (stops[idx + 1][1] - stops[idx][1]) * local_t
    return [round(lat, 6), round(lng, 6)]


def generate_transit() -> TransitEvent:
    vehicles = []
    for i, route in enumerate(CTA_BUS_ROUTES):
        progress = random.random()
        delay = random.choices([0, 2, 5, 10, 20], weights=[50, 25, 15, 8, 2])[0]
        status = TransitStatus.ON_TIME if delay == 0 else (TransitStatus.DELAYED if delay < 15 else TransitStatus.STOPPED)
        vehicles.append(
            TransitVehicle(
                id=f"bus-{route['route'].split('-')[0]}-{i:04d}",
                route=route["route"],
                mode=TransitMode.BUS,
                position=_interpolate(route["stops"], progress),
                heading=round(random.uniform(0, 360), 1),
                speed_mph=round(random.uniform(5, 25), 1) if status != TransitStatus.STOPPED else 0,
                delay_minutes=delay,
                status=status,
            )
        )
    for i, line in enumerate(CTA_TRAIN_LINES):
        progress = random.random()
        delay = random.choices([0, 1, 3, 8], weights=[60, 20, 15, 5])[0]
        status = TransitStatus.ON_TIME if delay == 0 else TransitStatus.DELAYED
        vehicles.append(
            TransitVehicle(
                id=f"train-{line['route'].lower().replace(' ', '-')}-{i:04d}",
                route=line["route"],
                mode=TransitMode.TRAIN,
                position=_interpolate(line["stops"], progress),
                heading=round(random.uniform(0, 360), 1),
                speed_mph=round(random.uniform(15, 45), 1),
                delay_minutes=delay,
                status=status,
            )
        )
    return TransitEvent(timestamp=datetime.now(timezone.utc), vehicles=vehicles)
