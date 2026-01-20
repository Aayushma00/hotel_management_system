from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("PORT", "5001"))

def try_prophet_forecast(df: pd.DataFrame):
    """Use Prophet if installed. Return (pred_value, model_name, note)."""
    try:
        from prophet import Prophet  # type: ignore
    except Exception:
        return None, "moving_average", "Prophet not installed; using moving average fallback."

    # Prophet expects columns: ds (date), y (value)
    m = Prophet(daily_seasonality=True, weekly_seasonality=True, yearly_seasonality=False)
    m.fit(df)

    future = m.make_future_dataframe(periods=1, freq="D")
    fcst = m.predict(future)

    yhat = float(fcst.tail(1)["yhat"].iloc[0])
    # Round to non-negative integer bookings
    pred = max(0, int(round(yhat)))
    tomorrow = str(fcst.tail(1)["ds"].dt.date.iloc[0])
    return (pred, "prophet", None), tomorrow

def moving_average_forecast(df: pd.DataFrame):
    # Very simple: average of last 7 days (or fewer if not available)
    df_sorted = df.sort_values("ds")
    window = df_sorted.tail(7)
    avg = float(window["y"].mean())
    pred = max(0, int(round(avg)))

    last_date = pd.to_datetime(df_sorted["ds"].iloc[-1])
    tomorrow = str((last_date + pd.Timedelta(days=1)).date())
    return pred, tomorrow

@app.get("/")
def root():
    return jsonify({"ok": True, "name": "HMS Forecast Service"})

@app.post("/predict")
def predict():
    payload = request.get_json(force=True, silent=True) or {}
    history = payload.get("history", [])

    if not history or not isinstance(history, list):
        return jsonify({"error": "history must be a list of {ds, y}"}), 400

    df = pd.DataFrame(history)
    if "ds" not in df.columns or "y" not in df.columns:
        return jsonify({"error": "history items must contain ds and y"}), 400

    # Ensure types
    df["ds"] = pd.to_datetime(df["ds"]).dt.date.astype(str)
    df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)

    # If too small dataset, use last value
    if len(df) < 3:
        last = int(df.iloc[-1]["y"])
        last_date = pd.to_datetime(df.iloc[-1]["ds"])
        tomorrow = str((last_date + pd.Timedelta(days=1)).date())
        return jsonify({
            "model": "last_value",
            "tomorrow": tomorrow,
            "predicted_bookings": max(0, last),
            "note": "Not enough data; using last known value."
        })

    # Try Prophet
    try:
        (pred, model_name, note), tomorrow = try_prophet_forecast(df)
        if pred is not None:
            return jsonify({
                "model": model_name,
                "tomorrow": tomorrow,
                "predicted_bookings": pred,
                **({"note": note} if note else {})
            })
    except Exception as e:
        # If Prophet fails for any reason, fallback
        pass

    pred, tomorrow = moving_average_forecast(df)
    return jsonify({
        "model": "moving_average",
        "tomorrow": tomorrow,
        "predicted_bookings": pred,
        "note": "Fallback forecast (average of last 7 days)."
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
