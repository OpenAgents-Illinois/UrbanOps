from datetime import datetime

from shared.schemas import (
    CongestionLevel, IncidentCategory, IncidentStatus,
    Precipitation, Severity, TransitMode, TransitStatus,
)
from generators.traffic import generate_traffic
from generators.transit import generate_transit
from generators.incidents import maybe_generate_incident
from generators.weather import generate_weather


def test_generate_traffic_returns_all_roads():
    event = generate_traffic()
    assert event.type == "traffic"
    assert isinstance(event.timestamp, datetime)
    assert len(event.segments) > 0
    for seg in event.segments:
        assert 0 <= seg.speed_mph <= seg.free_flow_mph + 5
        assert seg.congestion_level in CongestionLevel


def test_generate_transit_returns_vehicles():
    event = generate_transit()
    assert event.type == "transit"
    assert len(event.vehicles) > 0
    for v in event.vehicles:
        assert v.mode in TransitMode
        assert v.status in TransitStatus
        assert len(v.position) == 2


def test_maybe_generate_incident():
    incidents = []
    for _ in range(200):
        inc = maybe_generate_incident()
        if inc is not None:
            incidents.append(inc)
    assert len(incidents) > 0
    inc = incidents[0]
    assert inc.type == "incident"
    assert inc.category in IncidentCategory
    assert inc.severity in Severity
    assert inc.status in IncidentStatus
    assert len(inc.position) == 2


def test_generate_weather():
    event = generate_weather()
    assert event.type == "weather"
    assert -20 <= event.conditions.temperature_f <= 110
    assert event.conditions.precipitation in Precipitation
    assert event.conditions.visibility_miles > 0
