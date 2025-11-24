<h1 align="center"><b>🌾 SMART AGRO ASSISTANT</b></h1>
<h3 align="center"><b>Rainfall Prediction & Crop Recommendation Using Machine Learning</b></h3>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python">
  <img src="https://img.shields.io/badge/Streamlit-WebApp-red?logo=streamlit">
  <img src="https://img.shields.io/badge/ScikitLearn-ML-yellow?logo=scikitlearn">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen">
</p>

<p align="center">
</p>
📌 1. Project Overview

The Smart Agro Assistant is an intelligent agriculture-support system that helps users:

✔ Predict next-month rainfall

✔ Recommend the best crop to cultivate

✔ Analyze model performance through visualizations

✔ Interact through a modern Streamlit UI

This project combines machine learning, data preprocessing, and interactive UI design to support data-driven agricultural decisions.

📌 2. Key Features

🌧️ Rainfall Prediction

Uses Random Forest Regressor

✔ Inputs: month, lag1, lag2, lag3

✔ Output: predicted rainfall (mm)

✔ Metrics: MAE ≈ 51 mm, RMSE ≈ 107 mm

✔ Includes feature importance chart

🌱 Crop Recommendation

Uses Random Forest Classifier

✔ Inputs: N, P, K, temperature, humidity, pH, rainfall

✔ Output: recommended crop (22 classes)

✔ Accuracy: 99.3%

✔ Works for fruits, cereals, vegetables & pulses

📊 Model Evaluation Dashboard

✔ Classification report

✔ Confusion matrix

✔ Feature importance charts

✔ Downloadable evaluation summary

🎨 Modern Streamlit UI

✔ Glass-morphism styling

✔ Sidebar controls

✔ Sample preset values

✔ Attractive layout & visuals

📌 3. Machine Learning Models

🌧️ Rainfall Model

Algorithm: RandomForestRegressor

Input features: month, lag1, lag2, lag3

Performance:

✔ MAE: ≈ 51 mm

✔ RMSE: ≈ 107 mm

🌱 Crop Recommendation Model

Algorithm: RandomForestClassifier

Features: N, P, K, temperature, humidity, pH, rainfall

Results:

✔ Accuracy: 0.993

✔ Excellent F1-scores for all crops

📌📌📌 4. Model Files (Important)

Model files are not included in this repository due to GitHub’s 100MB limit.

To get trained rainfall & crop models:

📧 Contact: haripriyask964@gmail.com

📌 5. Future Enhancements

⬜ Integrate real-time weather API

⬜ Add fertilizer recommendation

⬜ Add crop yield prediction

⬜ Mobile-friendly layout

⬜ Add backend API using FastAPI

📌 6 . Author

Haripriya SK
Final Year – Data Analytics
Kalasalingam University
📧 Email: haripriyask964@gmail.com

⭐ If you found this project useful, please give the repo a STAR!
