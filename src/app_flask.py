from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import numpy as np

# Flask app setup

app = Flask(__name__)
CORS(app)  # allow React frontend to call this API

# BASE_DIR = src folder, PROJECT_ROOT = main project root, MODELS_DIR = /models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

# 👇 Change the filename here if your file is different
CROP_MODEL_PATH = os.path.join(MODELS_DIR, "crop_model.pkl")

try:
    crop_model = joblib.load(CROP_MODEL_PATH)
    print(f"[INFO] Loaded crop model from {CROP_MODEL_PATH}")
except Exception as e:
    print("[ERROR] Could not load crop model:", e)
    crop_model = None


# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.route("/", methods=["GET"])
def index():
    """Simple health check."""
    return jsonify({"status": "ok", "message": "Flask API running"}), 200


@app.route("/api/recommend-crop", methods=["POST"])
def recommend_crop():
    """
    Crop recommendation endpoint.

    Frontend sends:
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

    Model expects 7 features (likely: N, P, K, temperature, humidity, pH, rainfall).
    We'll estimate rainfall from lag values for now.
    """
    try:
        if crop_model is None:
            return jsonify({"error": "Crop model not loaded"}), 500

        data = request.get_json(force=True)
        print("Received data:", data)

        # Extract inputs
        month = float(data["month"])
        lag1 = float(data["lag1"])
        lag2 = float(data["lag2"])
        lag3 = float(data["lag3"])
        N = float(data["N"])
        P = float(data["P"])
        K = float(data["K"])
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        pH = float(data["pH"])

        # 🔹 Estimate rainfall from lag values (simple average for now)
        rainfall_est = (lag1 + lag2 + lag3) / 3.0

        # ⚠️ IMPORTANT: Order must match how you trained the model.
        # Assuming: [N, P, K, temperature, humidity, pH, rainfall]
        features = np.array(
            [[N, P, K, temperature, humidity, pH, rainfall_est]],
            dtype=float,
        )

        # Now features has shape (1, 7) which matches the model
        pred = crop_model.predict(features)[0]

        response = {"crop": str(pred)}

        #confidence/top3 if available
        if hasattr(crop_model, "predict_proba"):
            probs = crop_model.predict_proba(features)[0]
            max_conf = float(np.max(probs))
            response["confidence"] = max_conf

            classes = crop_model.classes_
            top3_idx = np.argsort(probs)[::-1][:3]
            top3_labels = [str(classes[i]) for i in top3_idx]
            response["top3"] = top3_labels

        return jsonify(response), 200

    except KeyError as e:
        msg = f"Missing field in request: {e}"
        print(msg)
        return jsonify({"error": msg}), 400
    except Exception as e:
        print("Error in /api/recommend-crop:", e)
        return jsonify({"error": str(e)}), 500
@app.route("/api/predict-rainfall", methods=["POST"])
def predict_rainfall():
    """
    Simple rainfall prediction endpoint.

    Expects:
    {
      "month": 11,
      "lag1": 60,
      "lag2": 55,
      "lag3": 50
    }

    Currently just returns average of lag1–lag3 as a basic estimate.
    You can replace this logic later with your trained rainfall model.
    """
    try:
        data = request.get_json(force=True)
        print("Rainfall request:", data)

        month = float(data["month"])
        lag1 = float(data["lag1"])
        lag2 = float(data["lag2"])
        lag3 = float(data["lag3"])

        rainfall_est = (lag1 + lag2 + lag3) / 3.0

        return jsonify({
            "rainfall": rainfall_est,
            "unit": "mm",
            "note": "Simple average of lag values (placeholder model)"
        }), 200

    except KeyError as e:
        msg = f"Missing field in request: {e}"
        print(msg)
        return jsonify({"error": msg}), 400
    except Exception as e:
        print("Error in /api/predict-rainfall:", e)
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    # React calls http://127.0.0.1:5000
    app.run(host="127.0.0.1", port=5000, debug=True)
