import joblib
import numpy as np
from pathlib import Path
import project_config as cfg

BASE_DIR = Path(__file__).resolve().parent.parent

rf_rain = joblib.load(cfg.RAINFALL_MODEL_PATH)
rf_crop = joblib.load(cfg.CROP_MODEL_PATH)

def predict_rainfall(month, lag1, lag2, lag3):
    X = np.array([[month, lag1, lag2, lag3]])
    return float(rf_rain.predict(X)[0])

def recommend_crop(N, P, K, T, H, pH, rainfall):
    X = np.array([[N, P, K, T, H, pH, rainfall]])
    return rf_crop.predict(X)[0]
