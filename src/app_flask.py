from flask import Flask, request, jsonify, render_template
from pathlib import Path
import sys
import numpy as np
import joblib
import pandas as pd

# ---------- Paths & config ----------
APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parent

sys.path.insert(0, str(PROJECT_DIR / "src"))
sys.path.insert(0, str(PROJECT_DIR))

import project_config as cfg  # your existing config

app = Flask(
    __name__,
    template_folder=str(APP_DIR / "templates"),
    static_folder=str(APP_DIR / "static"),
)

# ---------- Load models & data ----------
rf_rain = joblib.load(cfg.RAINFALL_MODEL_PATH)
rf_crop = joblib.load(cfg.CROP_MODEL_PATH)

df_crop = pd.read_csv(cfg.CROP_CSV)
df_rain = pd.read_csv(cfg.RAINFALL_CSV, sep=";")
df_rain.columns = df_rain.columns.str.replace('"', "")


# ---------- Helpers ----------
def prepare_rain_data(df: pd.DataFrame):
    daily_cols = [c for c in cfg.DAILY_COLS if c in df.columns]
    rain = df[[cfg.STATE_COL, cfg.DIST_COL, cfg.MONTH_COL] + daily_cols].copy()

    for c in daily_cols:
        rain[c] = pd.to_numeric(rain[c], errors="coerce")

    rain["total_rainfall"] = rain[daily_cols].sum(axis=1)
    rain = rain.sort_values([cfg.STATE_COL, cfg.DIST_COL, cfg.MONTH_COL])

    rain["lag1"] = rain.groupby([cfg.STATE_COL, cfg.DIST_COL])["total_rainfall"].shift(1)
    rain["lag2"] = rain.groupby([cfg.STATE_COL, cfg.DIST_COL])["total_rainfall"].shift(2)
    rain["lag3"] = rain.groupby([cfg.STATE_COL, cfg.DIST_COL])["total_rainfall"].shift(3)

    rain = rain.dropna(subset=["lag1", "lag2", "lag3"])

    feature_cols = [cfg.MONTH_COL, "lag1", "lag2", "lag3"]
    X = rain[feature_cols]
    y = rain["total_rainfall"]
    return rain, X, y, feature_cols


def predict_rainfall(month, lag1, lag2, lag3) -> float:
    X = np.array([[month, lag1, lag2, lag3]])
    return float(rf_rain.predict(X)[0])


def predict_crop_with_probs(N, P, K, T, H, pH, rainfall):
    X = np.array([[N, P, K, T, H, pH, rainfall]])
    probs = rf_crop.predict_proba(X)[0]
    classes = rf_crop.classes_

    idx_sorted = np.argsort(probs)[::-1]
    main_idx = idx_sorted[0]
    main_crop = classes[main_idx]
    main_score = float(probs[main_idx] * 100)

    top3 = []
    for i in idx_sorted[:3]:
        top3.append(
            {
                "crop": str(classes[i]),
                "score": float(probs[i] * 100),
            }
        )

    return main_crop, main_score, top3


def make_advice(crop, rainfall):
    crop = str(crop).lower()
    if rainfall > 250:
        rain_desc = "Very high rainfall – ensure good drainage and flood protection."
    elif rainfall > 150:
        rain_desc = "Good monsoon rainfall – ideal for water-loving crops."
    elif rainfall > 80:
        rain_desc = "Moderate rainfall – monitor soil moisture regularly."
    else:
        rain_desc = "Low rainfall – consider irrigation or drought-tolerant crops."

    if crop in {"rice", "paddy"}:
        crop_note = "Rice prefers standing water and heavy monsoon conditions."
    elif crop in {"banana", "coconut", "sugarcane"}:
        crop_note = "This crop suits warm, humid climates with good rainfall."
    elif crop in {"chickpea", "lentil", "blackgram", "mungbean"}:
        crop_note = "Pulses are often suitable for relatively drier conditions."
    elif crop in {"coffee"}:
        crop_note = "Coffee prefers cool, high-rainfall hilly regions."
    else:
        crop_note = "Match local soil type and management practices for best yield."

    return f"{rain_desc} {crop_note}"


# ---------- Routes ----------

@app.route("/")
def home():
    # Home page: basic info
    # simple crop stats to show on cards
    crop_counts = df_crop[cfg.CROP_TARGET_COL].value_counts().sort_index()
    num_crops = crop_counts.shape[0]
    num_rows = df_crop.shape[0]
    return render_template(
        "home.html",
        num_crops=num_crops,
        num_rows=num_rows,
        top_crops=list(crop_counts.index[:6]),
    )


@app.route("/predict")
def predict_page():
    # shows the form UI – JS will call /api/predict
    return render_template("predict.html")


@app.route("/dashboard")
def dashboard():
    # Build some data for visualizations
    # 1) Crop distribution
    crop_counts = df_crop[cfg.CROP_TARGET_COL].value_counts().sort_index()
    crop_labels = list(crop_counts.index)
    crop_values = [int(v) for v in crop_counts.values]

    # 2) Rainfall by month (average)
    rain_prepared, Xr, yr, features_r = prepare_rain_data(df_rain)
    month_avg = rain_prepared.groupby(cfg.MONTH_COL)["total_rainfall"].mean().sort_index()
    month_labels = [int(m) for m in month_avg.index]
    month_values = [float(v) for v in month_avg.values]

    # 3) Feature importance for crop model
    crop_feat_importance = list(rf_crop.feature_importances_)
    crop_feat_labels = list(cfg.CROP_FEATURE_COLS)

    return render_template(
        "dashboard.html",
        crop_labels=crop_labels,
        crop_values=crop_values,
        month_labels=month_labels,
        month_values=month_values,
        crop_feat_labels=crop_feat_labels,
        crop_feat_importance=crop_feat_importance,
    )


@app.route("/about")
def about():
    return render_template("about.html")


# ---------- API for prediction ----------

@app.route("/api/predict", methods=["POST"])
def api_predict():
    data = request.json

    month = int(data["month"])
    lag1 = float(data["lag1"])
    lag2 = float(data["lag2"])
    lag3 = float(data["lag3"])

    N = float(data["N"])
    P = float(data["P"])
    K = float(data["K"])
    T = float(data["T"])
    H = float(data["H"])
    pH = float(data["pH"])

    # 1) Rainfall
    pred_rain = predict_rainfall(month, lag1, lag2, lag3)

    # 2) Crop + alternatives
    main_crop, main_score, top3 = predict_crop_with_probs(N, P, K, T, H, pH, pred_rain)

    # 3) Advice
    advice = make_advice(main_crop, pred_rain)

    return jsonify(
        {
            "predicted_rainfall": pred_rain,
            "main_crop": str(main_crop),
            "main_crop_score": main_score,
            "alternatives": top3,
            "advice": advice,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
