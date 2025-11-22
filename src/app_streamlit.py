import sys
from pathlib import Path
import io

import joblib
import numpy as np
import pandas as pd
import streamlit as st
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
)
import matplotlib.pyplot as plt

APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parent

sys.path.insert(0, str(PROJECT_DIR / "src"))
sys.path.insert(0, str(PROJECT_DIR))

import project_config as cfg

rf_rain = joblib.load(cfg.RAINFALL_MODEL_PATH)
rf_crop = joblib.load(cfg.CROP_MODEL_PATH)

df_crop = pd.read_csv(cfg.CROP_CSV)
df_rain = pd.read_csv(cfg.RAINFALL_CSV, sep=";")
df_rain.columns = df_rain.columns.str.replace('"', "")

def prepare_rain_data(df):
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
    return X, y, feature_cols

def predict_monthly_rainfall(model, month, lag1, lag2, lag3):
    X = np.array([[month, lag1, lag2, lag3]])
    return float(model.predict(X)[0])

def recommend_crop(model, N, P, K, T, H, pH, rainfall):
    X = np.array([[N, P, K, T, H, pH, rainfall]])
    return model.predict(X)[0]

def crop_display_name(crop):
    mapping = {
        "rice": "🍚 Rice",
        "maize": "🌽 Maize",
        "chickpea": "🧆 Chickpea",
        "kidneybeans": "🫘 Kidney Beans",
        "pigeonpeas": "🫘 Pigeon Peas",
        "mothbeans": "🫘 Moth Beans",
        "mungbean": "🫘 Mung Bean",
        "blackgram": "🫘 Black Gram",
        "lentil": "🥣 Lentil",
        "pomegranate": "🍎 Pomegranate",
        "banana": "🍌 Banana",
        "mango": "🥭 Mango",
        "grapes": "🍇 Grapes",
        "watermelon": "🍉 Watermelon",
        "muskmelon": "🍈 Muskmelon",
        "apple": "🍎 Apple",
        "orange": "🍊 Orange",
        "papaya": "🍉 Papaya",
        "coconut": "🥥 Coconut",
        "cotton": "🧵 Cotton",
        "jute": "🪢 Jute",
        "coffee": "☕ Coffee",
    }
    return mapping.get(str(crop).lower(), crop)

def get_sample_scenarios():
    return {
        "High rainfall – tropical": {
            "month": 9,
            "lag1": 260.0,
            "lag2": 230.0,
            "lag3": 210.0,
            "N": 100.0,
            "P": 55.0,
            "K": 60.0,
            "T": 28.0,
            "H": 85.0,
            "pH": 6.4,
        },
        "Dry region – pulses": {
            "month": 2,
            "lag1": 40.0,
            "lag2": 35.0,
            "lag3": 20.0,
            "N": 40.0,
            "P": 20.0,
            "K": 30.0,
            "T": 22.0,
            "H": 50.0,
            "pH": 7.0,
        },
        "Moderate – fruits": {
            "month": 6,
            "lag1": 120.0,
            "lag2": 90.0,
            "lag3": 60.0,
            "N": 70.0,
            "P": 45.0,
            "K": 50.0,
            "T": 26.0,
            "H": 65.0,
            "pH": 6.2,
        },
    }

if "inputs" not in st.session_state:
    st.session_state["inputs"] = {
        "month": 7,
        "lag1": 200.0,
        "lag2": 150.0,
        "lag3": 100.0,
        "N": 90.0,
        "P": 40.0,
        "K": 40.0,
        "T": 25.0,
        "H": 60.0,
        "pH": 6.5,
    }

st.set_page_config(page_title="Smart Agro Assistant", page_icon="🌾", layout="wide")

st.markdown("""
    <style>
    .main {
        background: linear-gradient(135deg,#e0f2fe,#fefce8,#fdf2f8);
    }
    .glass-card {
        background: rgba(255,255,255,0.75);
        border-radius: 22px;
        padding: 1.2rem;
        backdrop-filter: blur(10px);
    }
    .metric-card {
        background: rgba(255,255,255,0.85);
        padding: 1rem;
        border-radius: 18px;
    }
    .section-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 0.6rem;
    }
    .title-text {
        font-size: 2.4rem;
        font-weight: 900;
    }
    </style>
""", unsafe_allow_html=True)

header_left, header_right = st.columns([2.5, 1.5])

with header_left:
    st.markdown(
        '<div class="glass-card"><div class="title-text">Smart Agro Assistant 🌾</div>'
        '<div>Rainfall forecasting and crop recommendation using ML.</div></div>',
        unsafe_allow_html=True
    )

with header_right:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.markdown("### **System Status**")
    st.write("✅ Rainfall model loaded")
    st.write("✅ Crop model loaded")
    st.write("📊 Dataset: IMD Rainfall + Crop Recommendation")
    st.markdown("</div>", unsafe_allow_html=True)

with st.sidebar:
    st.markdown("### ⚙️ Controls")
    default_month = st.slider("Default month", 1, 12, 7)
    default_temp = st.slider("Default temperature (°C)", -5, 50, 25)
    default_humidity = st.slider("Default humidity (%)", 0, 100, 60)
    st.markdown("---")
    st.markdown("### ℹ️ About")
    st.write("Crop & Rainfall ML project")
    st.write("RandomForest models")

tab_pred, tab_eval = st.tabs(["🔮 Prediction", "📊 Model Evaluation"])

with tab_pred:
    st.markdown('<div class="section-title">Quick Sample Scenarios</div>', unsafe_allow_html=True)
    presets = get_sample_scenarios()
    preset_names = ["Custom input"] + list(presets.keys())
    preset_choice = st.selectbox("Choose a sample scenario", preset_names, index=0)

    if preset_choice != "Custom input":
        st.session_state["inputs"] = presets[preset_choice]

    st.markdown('<div class="section-title">Step 1: Rainfall Inputs</div>', unsafe_allow_html=True)
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        month = st.number_input("Month", 1, 12, int(st.session_state["inputs"]["month"]))
    with c2:
        lag1 = st.number_input("Last month rainfall", 0.0, 500.0, float(st.session_state["inputs"]["lag1"]))
    with c3:
        lag2 = st.number_input("Rainfall 2 months ago", 0.0, 500.0, float(st.session_state["inputs"]["lag2"]))
    with c4:
        lag3 = st.number_input("Rainfall 3 months ago", 0.0, 500.0, float(st.session_state["inputs"]["lag3"]))

    st.markdown('<div class="section-title">Step 2: Soil Inputs</div>', unsafe_allow_html=True)
    s1, s2, s3 = st.columns(3)
    with s1:
        N = st.number_input("Nitrogen (N)", 0.0, 200.0, float(st.session_state["inputs"]["N"]))
        P = st.number_input("Phosphorus (P)", 0.0, 200.0, float(st.session_state["inputs"]["P"]))
    with s2:
        K = st.number_input("Potassium (K)", 0.0, 200.0, float(st.session_state["inputs"]["K"]))
        pH = st.number_input("pH", 0.0, 14.0, float(st.session_state["inputs"]["pH"]))
    with s3:
        T = st.number_input("Temperature °C", -10.0, 50.0, float(st.session_state["inputs"]["T"]))
        H = st.number_input("Humidity %", 0.0, 100.0, float(st.session_state["inputs"]["H"]))

    st.session_state["inputs"] = {
        "month": month,
        "lag1": lag1,
        "lag2": lag2,
        "lag3": lag3,
        "N": N,
        "P": P,
        "K": K,
        "T": T,
        "H": H,
        "pH": pH,
    }

    st.markdown("")
    if st.button("✨ Predict Rainfall & Recommend Crop"):
        pred_rain = predict_monthly_rainfall(rf_rain, month, lag1, lag2, lag3)
        crop_raw = recommend_crop(rf_crop, N, P, K, T, H, pH, pred_rain)
        crop = crop_display_name(crop_raw)

        colA, colB = st.columns(2)
        with colA:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Predicted Rainfall", f"{pred_rain:.2f} mm")
            st.markdown("</div>", unsafe_allow_html=True)
        with colB:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Recommended Crop", crop)
            st.markdown("</div>", unsafe_allow_html=True)

        with st.expander("View detailed input summary"):
            st.write(
                {
                    "month": month,
                    "lag1": lag1,
                    "lag2": lag2,
                    "lag3": lag3,
                    "N": N,
                    "P": P,
                    "K": K,
                    "temperature": T,
                    "humidity": H,
                    "pH": pH,
                    "predicted_rainfall": pred_rain,
                    "recommended_crop": crop_raw,
                }
            )

with tab_eval:
    st.markdown('<div class="section-title">Rainfall Model Metrics</div>', unsafe_allow_html=True)
    Xr, yr, features_r = prepare_rain_data(df_rain)
    pred_r = rf_rain.predict(Xr)
    mae = mean_absolute_error(yr, pred_r)
    rmse = np.sqrt(mean_squared_error(yr, pred_r))

    c1, c2 = st.columns(2)
    with c1:
        st.metric("MAE", f"{mae:.2f} mm")
    with c2:
        st.metric("RMSE", f"{rmse:.2f} mm")

    st.markdown("### Feature Importance (Rainfall)")
    fig1, ax1 = plt.subplots()
    ax1.bar(features_r, rf_rain.feature_importances_)
    ax1.set_ylabel("Importance")
    ax1.set_xlabel("Feature")
    st.pyplot(fig1)

    st.markdown("---")
    st.markdown('<div class="section-title">Crop Model Metrics</div>', unsafe_allow_html=True)

    Xc = df_crop[cfg.CROP_FEATURE_COLS]
    yc = df_crop[cfg.CROP_TARGET_COL]
    yc_pred = rf_crop.predict(Xc)

    acc = accuracy_score(yc, yc_pred)
    st.metric("Accuracy", f"{acc:.3f}")

    st.markdown("### Classification Report")
    report_text = classification_report(yc, yc_pred)
    st.text(report_text)

    st.markdown("### Feature Importance (Crop)")
    fig2, ax2 = plt.subplots()
    ax2.bar(cfg.CROP_FEATURE_COLS, rf_crop.feature_importances_)
    ax2.set_ylabel("Importance")
    ax2.set_xlabel("Feature")
    st.pyplot(fig2)

    st.markdown("### Confusion Matrix")
    labels = sorted(df_crop[cfg.CROP_TARGET_COL].unique())
    cm = confusion_matrix(yc, yc_pred, labels=labels)

    fig3, ax3 = plt.subplots(figsize=(8, 8))
    im = ax3.imshow(cm, cmap="Blues")
    ax3.set_xticks(range(len(labels)))
    ax3.set_yticks(range(len(labels)))
    ax3.set_xticklabels(labels, rotation=90)
    ax3.set_yticklabels(labels)
    ax3.set_xlabel("Predicted")
    ax3.set_ylabel("True")
    for i in range(len(labels)):
        for j in range(len(labels)):
            ax3.text(j, i, cm[i, j], ha="center", va="center", color="black", fontsize=6)
    fig3.colorbar(im)
    st.pyplot(fig3)

    summary_buf = io.StringIO()
    summary_buf.write("Rainfall Model:\n")
    summary_buf.write(f"MAE: {mae:.3f} mm\n")
    summary_buf.write(f"RMSE: {rmse:.3f} mm\n\n")
    summary_buf.write("Crop Model:\n")
    summary_buf.write(f"Accuracy: {acc:.3f}\n\n")
    summary_buf.write("Classification Report:\n")
    summary_buf.write(report_text)

    st.download_button(
        label="⬇️ Download Model Evaluation Summary",
        data=summary_buf.getvalue(),
        file_name="model_evaluation_summary.txt",
        mime="text/plain",
    )
