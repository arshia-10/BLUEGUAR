import pandas as pd
from .weather_engine import get_user_location, build_daily_features_from_history
import os
os.makedirs("data", exist_ok=True)

OUT_CSV = "data/daily_features.csv"

def build_and_save(days_history: int = 30):
    loc = get_user_location()
    city, lat, lon = loc["city"], loc["lat"], loc["lon"]
    features = build_daily_features_from_history(lat, lon, days_history)
    if not features:
        raise RuntimeError("No history fetched; check API key and connectivity.")
    df = pd.DataFrame(features)
    # Save CSV for trainer
    df.to_csv(OUT_CSV, index=False)
    return df

if __name__ == "__main__":
    df = build_and_save()
    print("Saved features to", OUT_CSV, "rows:", len(df))
