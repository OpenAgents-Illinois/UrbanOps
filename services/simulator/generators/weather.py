import random
from datetime import datetime, timezone

from shared.schemas import Precipitation, WeatherConditions, WeatherEvent

_state = {
    "temp": 34.0,
    "wind": 15.0,
    "precip": Precipitation.SNOW,
    "visibility": 5.0,
}

_WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

_ALERTS = {
    Precipitation.SNOW: "Winter Storm Warning",
    Precipitation.SLEET: "Ice Storm Advisory",
    Precipitation.FOG: "Dense Fog Advisory",
}


def generate_weather() -> WeatherEvent:
    _state["temp"] += random.gauss(0, 1.5)
    _state["temp"] = max(-10, min(100, _state["temp"]))
    _state["wind"] += random.gauss(0, 2)
    _state["wind"] = max(0, min(60, _state["wind"]))

    if random.random() < 0.1:
        _state["precip"] = random.choice(list(Precipitation))

    base_vis = {
        Precipitation.NONE: 10.0,
        Precipitation.RAIN: 5.0,
        Precipitation.SNOW: 2.5,
        Precipitation.SLEET: 3.0,
        Precipitation.FOG: 0.5,
    }
    _state["visibility"] = base_vis[_state["precip"]] + random.gauss(0, 0.5)
    _state["visibility"] = max(0.1, _state["visibility"])

    alert = _ALERTS.get(_state["precip"]) if _state["wind"] > 20 else None

    return WeatherEvent(
        timestamp=datetime.now(timezone.utc),
        conditions=WeatherConditions(
            temperature_f=round(_state["temp"], 1),
            wind_speed_mph=round(_state["wind"], 1),
            wind_direction=random.choice(_WIND_DIRS),
            precipitation=_state["precip"],
            visibility_miles=round(_state["visibility"], 1),
            alert=alert,
        ),
    )
