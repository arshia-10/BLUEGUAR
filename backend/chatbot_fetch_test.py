"""
Quick diagnostic: try fetching forecast from WeatherAPI using chatbot.weather_engine.
Run from the `backend` folder with the same Python you run the Django server with.
"""
import json
import sys

def main():
    try:
        from chatbot.weather_engine import fetch_forecast
    except Exception as e:
        print("IMPORT_ERROR", str(e))
        return

    lat, lon = 28.7041, 77.1025  # Delhi
    try:
        data = fetch_forecast(lat, lon)
    except Exception as e:
        print("FETCH_EXCEPTION", str(e))
        return

    if not data:
        print("NO_DATA_RETURNED")
        return

    # Print a compact summary
    try:
        forecast = data.get('forecast')
        if not forecast:
            print("NO_FORECAST_KEY", json.dumps(data)[:1000])
            return
        days = forecast.get('forecastday', [])
        print("OK", {"days_returned": len(days), "keys": list(data.keys())})
    except Exception as e:
        print("PARSE_ERROR", str(e))

if __name__ == '__main__':
    main()
