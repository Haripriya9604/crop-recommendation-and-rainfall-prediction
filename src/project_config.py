import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")

RAINFALL_CSV = os.path.join(DATA_DIR, "rainfall.csv")
CROP_CSV = os.path.join(DATA_DIR, "Crop_recommendation.csv")

RAINFALL_MODEL_PATH = os.path.join(MODEL_DIR, "rainfall_model.pkl")
CROP_MODEL_PATH = os.path.join(MODEL_DIR, "crop_model.pkl")

STATE_COL = "state"
DIST_COL = "district"
MONTH_COL = "month"

def day_col_name(day):
    if day in (1, 21, 31):
        suf = "st"
    elif day in (2, 22):
        suf = "nd"
    elif day in (3, 23):
        suf = "rd"
    else:
        suf = "th"
    return f"{day}{suf}"

DAILY_COLS = [day_col_name(i) for i in range(1, 32)]

CROP_FEATURE_COLS = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

CROP_TARGET_COL = "label"

