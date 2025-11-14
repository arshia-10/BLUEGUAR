import requests
import unicodedata
import logging
import os
import json
from typing import Dict, List, Optional

API_KEY = "66424017c3a14f8ba5b150703251311"


# =====================================================
#   UTILS — Location Correction
# =====================================================
def _clean_city_name(city: str) -> str:
    """Remove accents: Patiāla → Patiala"""
    return unicodedata.normalize("NFKD", city).encode("ascii", "ignore").decode("ascii")


def get_user_location() -> Dict:
    """Try multiple services, fallback to Delhi."""
    services = [
        "https://ipinfo.io/json",
        "https://ipapi.co/json/",
        "https://ipwho.is/"
    ]
    headers = {"User-Agent": "Mozilla/5.0"}

    # configure logger based on env var
    logger = logging.getLogger(__name__)
    if os.environ.get("WEATHER_DEBUG") == "1":
        logging.basicConfig(level=logging.DEBUG)
        logger.setLevel(logging.DEBUG)

    for url in services:
        try:
            logger.debug(f"Trying location service: {url}")
            r = requests.get(url, headers=headers, timeout=6)
            logger.debug(f"Response status for {url}: {r.status_code}")
            if r.status_code == 200:
                try:
                    data = r.json()
                except Exception as e:
                    logger.debug(f"Failed to parse JSON from {url}: {e}")
                    continue

                # Avoid dumping huge or sensitive payloads; show a truncated JSON snippet
                try:
                    snippet = json.dumps(data, ensure_ascii=False)[:500]
                except Exception:
                    snippet = str(data)[:500]
                logger.debug(f"Response data (truncated) from {url}: {snippet}")

                city = data.get("city")
                # many services use 'loc' as 'lat,lon' while others provide 'latitude' and 'longitude'
                loc = data.get("loc") or f"{data.get('latitude')},{data.get('longitude')}"
                if city and loc and "," in loc:
                    try:
                        lat, lon = map(float, loc.split(","))
                        logger.info(f"Detected location: {city} ({lat},{lon}) from {url}")
                        return {"city": city, "lat": lat, "lon": lon}
                    except Exception as e:
                        logger.debug(f"Failed to parse lat/lon from {url} loc value '{loc}': {e}")
                        continue
            else:
                logger.debug(f"Non-200 response from {url}: {r.status_code}")
        except Exception as e:
            logger.debug(f"Location service {url} failed: {e}")

    logger.warning("All location services failed; falling back to default: Delhi")
    return {"city": "Delhi", "lat": 28.7041, "lon": 77.1025}


# =====================================================
#   FLOOD RISK ENGINE (Scientific Scoring)
# =====================================================
def compute_flood_index(day: Dict, next3: List[Dict]) -> int:
    rain = day["day"].get("totalprecip_mm", 0)
    chance = day["day"].get("daily_chance_of_rain", 0)
    wind = day["day"].get("maxwind_kph", 0)
    humidity = day["day"].get("avghumidity", 0)
    three_day_rain = sum(d["day"].get("totalprecip_mm", 0) for d in next3)

    score = 0

    # Rain intensity
    if rain >= 100: score += 40
    elif rain >= 70: score += 30
    elif rain >= 50: score += 20
    elif rain >= 20: score += 10
    else: score += 2

    # Accumulation
    if three_day_rain >= 150: score += 30
    elif three_day_rain >= 100: score += 20
    elif three_day_rain >= 50: score += 10

    # Chance of rain
    if chance >= 80: score += 15
    elif chance >= 60: score += 10
    elif chance >= 40: score += 5

    # Humidity
    if humidity >= 90: score += 7
    elif humidity >= 80: score += 4

    # Wind
    if wind >= 60: score += 10
    elif wind >= 40: score += 5

    return score


def risk_label(score: int) -> str:
    if score >= 60: return "HIGH"
    if score >= 35: return "MEDIUM"
    return "LOW"


# =====================================================
#   WEATHER FETCH — Forecast + Historical (30 days)
# =====================================================
def fetch_forecast(lat: float, lon: float) -> Optional[Dict]:
    url = f"http://api.weatherapi.com/v1/forecast.json?key={API_KEY}&q={lat},{lon}&days=10&aqi=no&alerts=yes"
    try:
        r = requests.get(url, timeout=8)
        data = r.json()
        if "forecast" in data:
            return data
    except:
        pass
    return None


def fetch_month_history(lat: float, lon: float) -> List[Dict]:
    """Fetch past 30 days (WeatherAPI supports this via history)"""
    from datetime import datetime, timedelta

    today = datetime.utcnow()
    days = []

    for i in range(1, 31):
        d = today - timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        url = f"http://api.weatherapi.com/v1/history.json?key={API_KEY}&q={lat},{lon}&dt={date_str}"

        try:
            r = requests.get(url, timeout=8)
            data = r.json()
            if "forecast" in data:
                days.append(data["forecast"]["forecastday"][0])
        except:
            continue

    return days


# =====================================================
#   FINAL OUTPUT — For Chatbot
# =====================================================
def get_final_risk_summary() -> str:
    loc = get_user_location()
    city, lat, lon = loc["city"], loc["lat"], loc["lon"]

    forecast_data = fetch_forecast(lat, lon)
    if not forecast_data:
        return "UNKNOWN"

    forecast = forecast_data["forecast"]["forecastday"]

    # DAILY + 3-DAY WINDOW RISK
    today_score = compute_flood_index(forecast[0], forecast[:3])

    # MONTH RISK (from 30 days history)
    history = fetch_month_history(lat, lon)
    month_scores = [compute_flood_index(d, history[i:i+3]) for i, d in enumerate(history)]
    month_score = max(month_scores) if month_scores else today_score

    final_score = max(today_score, month_score)
    final_risk = risk_label(final_score)

    return final_risk


# -----------------------------------------------------
# Backwards-compatible wrappers for blueguard_engine
# -----------------------------------------------------
def get_final_risk_and_score_for_location() -> dict:
    """Return final risk and numeric score for the current detected location.

    Returns a dict: {"final_risk": "HIGH|MEDIUM|LOW", "final_score": int, "city": str, "lat": float, "lon": float}
    If data cannot be fetched returns {"error": "..."}
    """
    loc = get_user_location()
    city, lat, lon = loc["city"], loc["lat"], loc["lon"]

    forecast_data = fetch_forecast(lat, lon)
    if not forecast_data:
        return {"error": "no_forecast_data"}

    forecast = forecast_data["forecast"]["forecastday"]

    today_score = compute_flood_index(forecast[0], forecast[:3])

    history = fetch_month_history(lat, lon)
    month_scores = [compute_flood_index(d, history[i:i+3]) for i, d in enumerate(history)]
    month_score = max(month_scores) if month_scores else today_score

    final_score = max(today_score, month_score)
    final_risk = risk_label(final_score)

    return {
        "final_risk": final_risk,
        "final_score": final_score,
        "city": city,
        "lat": lat,
        "lon": lon,
    }


def get_detailed_forecast_summary(days: int = 3) -> str:
    """Return a human-friendly multi-line summary for the next `days` forecast days.

    This is intended for use by the chatbot when the user asks for details.
    """
    loc = get_user_location()
    city, lat, lon = loc["city"], loc["lat"], loc["lon"]

    forecast_data = fetch_forecast(lat, lon)
    if not forecast_data:
        return "No detailed forecast available."

    forecast = forecast_data["forecast"]["forecastday"]
    parts = [f"Location: {city} ({lat:.4f},{lon:.4f})"]

    for i, day in enumerate(forecast[:days]):
        score = compute_flood_index(day, forecast[i:i+3])
        label = risk_label(score)
        date = day.get("date")
        d = day["day"]
        rain = d.get("totalprecip_mm", 0)
        chance = d.get("daily_chance_of_rain", 0)
        wind = d.get("maxwind_kph", 0)
        humidity = d.get("avghumidity", 0)

        parts.append(
            f"Date: {date} — Risk: {label} (Score: {score}) | Rain: {rain} mm | Chance: {chance}% | Wind: {wind} km/h | Humidity: {humidity}%"
        )

    return "\n".join(parts)


def build_daily_features_from_history(lat: float, lon: float, days: int = 30) -> List[Dict]:
    """Build simplified feature rows from historical data for model training.

    Returns a list of dicts where each dict represents features for a day.
    """
    history = fetch_month_history(lat, lon)
    features = []
    for day in history[:days]:
        d = day.get("day", {})
        row = {
            "date": day.get("date"),
            "totalprecip_mm": d.get("totalprecip_mm", 0),
            "daily_chance_of_rain": d.get("daily_chance_of_rain", 0),
            "maxwind_kph": d.get("maxwind_kph", 0),
            "avghumidity": d.get("avghumidity", 0),
            "flood_score": compute_flood_index(day, history[:3])
        }
        features.append(row)
    return features
