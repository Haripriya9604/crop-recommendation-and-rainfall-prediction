import os
import logging
from logging.handlers import RotatingFileHandler

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# -------------------------------------------------
# Flask app setup
# -------------------------------------------------
app = Flask(__name__)
CORS(app)  # Allow requests from React (localhost:5173 etc.)

# -------------------------------------------------
# Logging setup
# -------------------------------------------------
os.makedirs("logs", exist_ok=True)

log_formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)
log_file_path = os.path.join("logs", "predictions.log")

file_handler = RotatingFileHandler(
    log_file_path, maxBytes=1_000_000, backupCount=3, encoding="utf-8"
)
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.INFO)

logger = logging.getLogger("predictions")
logger.setLevel(logging.INFO)
if not logger.handlers:
    logger.addHandler(file_handler)

app_logger = app.logger
app_logger.setLevel(logging.INFO)

# -------------------------------------------------
# Model loading (paths relative to this file)
# -------------------------------------------------
# __file__ = src/app_flask.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))         # .../src
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))  # project root
MODEL_DIR = os.path.join(PROJECT_ROOT, "models")

CROP_MODEL_PATH = os.path.join(MODEL_DIR, "crop_model.pkl")
RAINFALL_MODEL_PATH = os.path.join(MODEL_DIR, "rainfall_model.pkl")

crop_model = None
rainfall_model = None

# Crop model
try:
    if os.path.exists(CROP_MODEL_PATH):
        crop_model = joblib.load(CROP_MODEL_PATH)
        app_logger.info(f"[MODEL] Loaded crop model from {CROP_MODEL_PATH}")
    else:
        app_logger.error(f"[MODEL] Crop model file not found at {CROP_MODEL_PATH}")
except Exception as e:
    app_logger.exception(f"[MODEL] Failed to load crop model: {e}")

# Rainfall model
try:
    if os.path.exists(RAINFALL_MODEL_PATH):
        rainfall_model = joblib.load(RAINFALL_MODEL_PATH)
        app_logger.info(f"[MODEL] Loaded rainfall model from {RAINFALL_MODEL_PATH}")
    else:
        app_logger.error(f"[MODEL] Rainfall model file not found at {RAINFALL_MODEL_PATH}")
except Exception as e:
    app_logger.exception(f"[MODEL] Failed to load rainfall model: {e}")

# -------------------------------------------------
# Helper functions
# -------------------------------------------------
def safe_float(d, key, default=0.0):
    """Get float from dict safely."""
    try:
        return float(d.get(key, default))
    except Exception:
        return float(default)


# -------------------------------------------------
# Health / root endpoints
# -------------------------------------------------
@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "message": "Flask API running"}), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# -------------------------------------------------
# Crop recommendation endpoint
# -------------------------------------------------
@app.route("/api/recommend-crop", methods=["POST"])
def recommend_crop():
    """
    Expected JSON from frontend:
    {
      "month": 11,
      "lag1": 60,
      "lag2": 55,
      "lag3": 50,
      "N": 60,
      "P": 40,
      "K": 50,
      "temperature": 23,
      "humidity": 55,
      "pH": 6.2
    }

    Internally we build 7 features:
      N, P, K, temperature, humidity, pH, avg_rainfall (derived from lag1-3)
    """
    data = request.get_json() or {}

    if crop_model is None:
        logger.error("CROP_PREDICTION | model not loaded | inputs=%s", data)
        return jsonify({"error": "Crop model not loaded on server"}), 500

    try:
        month = safe_float(data, "month", 1)
        lag1 = safe_float(data, "lag1", 0)
        lag2 = safe_float(data, "lag2", 0)
        lag3 = safe_float(data, "lag3", 0)

        N = safe_float(data, "N", 0)
        P = safe_float(data, "P", 0)
        K = safe_float(data, "K", 0)
        temperature = safe_float(data, "temperature", 0)
        humidity = safe_float(data, "humidity", 0)
        pH = safe_float(data, "pH", 7)

        avg_rainfall = (lag1 + lag2 + lag3) / 3.0

        # Feature vector (align this with how you trained crop_model)
        # Example: [N, P, K, temperature, humidity, pH, avg_rainfall]
        X = np.array([[N, P, K, temperature, humidity, pH, avg_rainfall]], dtype=float)

        pred_label = crop_model.predict(X)[0]

        confidence = None
        top3_labels = []
        top3_probs = []

        if hasattr(crop_model, "predict_proba"):
            proba = crop_model.predict_proba(X)[0]  # shape (n_classes,)
            classes = crop_model.classes_

            sorted_idx = np.argsort(proba)[::-1]
            top_idx = sorted_idx[:3]

            top3_labels = [str(classes[i]) for i in top_idx]
            top3_probs = [float(proba[i]) for i in top_idx]
            confidence = float(max(proba))
        else:
            confidence = 1.0
            top3_labels = [str(pred_label)]
            top3_probs = [1.0]

        response = {
            "crop": str(pred_label),
            "confidence": confidence,
            "top3": top3_labels,
            "top3_probs": top3_probs,
        }

        logger.info("CROP_PREDICTION | inputs=%s | output=%s", data, response)
        return jsonify(response), 200

    except Exception as e:
        logger.exception("CROP_PREDICTION_ERROR | inputs=%s", data)
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------
# Rainfall prediction endpoint
# -------------------------------------------------
@app.route("/api/predict-rainfall", methods=["POST"])
def predict_rainfall():
    """
    Expected JSON from frontend:
    {
      "month": 11,
      "lag1": 60,
      "lag2": 55,
      "lag3": 50
    }

    Example feature order for model:
      [month, lag1, lag2, lag3]
    """
    data = request.get_json() or {}

    if rainfall_model is None:
        logger.error("RAINFALL_PREDICTION | model not loaded | inputs=%s", data)
        return jsonify({"error": "Rainfall model not loaded on server"}), 500

    try:
        month = safe_float(data, "month", 1)
        lag1 = safe_float(data, "lag1", 0)
        lag2 = safe_float(data, "lag2", 0)
        lag3 = safe_float(data, "lag3", 0)

        X = np.array([[month, lag1, lag2, lag3]], dtype=float)

        pred_value = rainfall_model.predict(X)[0]
        rainfall_value = float(pred_value)

        response = {"rainfall": rainfall_value}

        logger.info("RAINFALL_PREDICTION | inputs=%s | output=%s", data, response)
        return jsonify(response), 200

    except Exception as e:
        logger.exception("RAINFALL_PREDICTION_ERROR | inputs=%s", data)
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------
# Main entry
# -------------------------------------------------
if __name__ == "__main__":
    # Debug for development. In production, use a WSGI server (gunicorn, etc.)
    app.run(host="127.0.0.1", port=5000, debug=True)
