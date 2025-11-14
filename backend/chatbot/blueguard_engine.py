try:
    import ollama
    OLLAMA_AVAILABLE = True
except Exception:
    OLLAMA_AVAILABLE = False

from .weather_engine import get_final_risk_and_score_for_location, get_detailed_forecast_summary

SYSTEM_PROMPT = """
You are BlueGuard — an assistant for flood alerts, safety and general help.
Rules:
1) NEVER produce flood risk answers for flood/weather queries yourself.
   Flood/weather queries are handled by a separate engine which returns
   ONLY: "Flood Risk: HIGH" or "Flood Risk: MEDIUM" or "Flood Risk: LOW".
2) If a user explicitly asks for DETAILS (words: "details", "explain", "show me forecast"),
   you may include the detailed forecast retrieved from the engine when requested.
3) For all other questions, behave as a helpful assistant.
"""

# Extensive keyword lists (expand as needed)
FLOOD_KEYWORDS = [
    "flood", "flooding", "rain", "rainfall", "storm", "weather", "alert",
    "risk", "water level", "overflow", "evacuate", "pani", "baarish", "precip"
]
DETAIL_KEYWORDS = ["detail", "explain", "show", "forecast", "why", "how bad", "give details"]

def is_flood_query(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in FLOOD_KEYWORDS)

def wants_details(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in DETAIL_KEYWORDS)

def blueguard_response(user_input: str) -> str:
    """
    SINGLE interface for all clients.
    - If flood/weather query: return "Flood Risk: HIGH|MEDIUM|LOW" or details if user asked.
    - Else: call LLM with system prompt and return its answer.
    """
    user_input = (user_input or "").strip()
    if not user_input:
        return "I didn't get that. Please ask again."

    if is_flood_query(user_input):
        # Use deterministic engine
        res = get_final_risk_and_score_for_location()
        if "error" in res:
            return "Unable to fetch weather data."
        risk = res["final_risk"]
        if wants_details(user_input):
            details = get_detailed_forecast_summary()
            return f"Flood Risk: {risk}\n\nDetails:\n{details}"
        return f"Flood Risk: {risk}"

    # Non-weather: forward to LLM (keeping system prompt)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_input}
    ]
    if not OLLAMA_AVAILABLE:
        return "LLM backend unavailable. Please configure Ollama or ask for weather-related queries."

    reply = ollama.chat(model="phi3:mini", messages=messages)
    return reply["message"]["content"].strip()
