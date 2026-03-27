import random
from datetime import datetime, timezone

from shared.schemas import CongestionLevel, TrafficEvent, TrafficSegment
from config import CHICAGO_ROADS


def _speed_to_congestion(speed: float, free_flow: float) -> CongestionLevel:
    ratio = speed / free_flow
    if ratio > 0.8:
        return CongestionLevel.FREE
    if ratio > 0.6:
        return CongestionLevel.LIGHT
    if ratio > 0.4:
        return CongestionLevel.MODERATE
    if ratio > 0.2:
        return CongestionLevel.HEAVY
    return CongestionLevel.SEVERE


def generate_traffic() -> TrafficEvent:
    segments = []
    for road in CHICAGO_ROADS:
        factor = random.betavariate(5, 2)
        speed = round(road["free_flow"] * factor, 1)
        segments.append(
            TrafficSegment(
                road=road["road"],
                from_pos=road["from"],
                to_pos=road["to"],
                speed_mph=speed,
                free_flow_mph=road["free_flow"],
                congestion_level=_speed_to_congestion(speed, road["free_flow"]),
            )
        )
    return TrafficEvent(timestamp=datetime.now(timezone.utc), segments=segments)
