# backend/models/lstm_model.py
import numpy as np
import tensorflow as tf
import joblib
from backend.db.database import engine
import pandas as pd

MODEL_PATH = 'backend/models/lstm_v1.h5'
SCALER_PATH = 'backend/models/scaler.pkl'
SEQUENCE_LEN = 12

_model = None
_scaler = None

def load_model():
    global _model, _scaler
    if _model is None:
        _model = tf.keras.models.load_model(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)

def get_prediction(house_id: str) -> dict:
    '''Fetch last 3hrs from DB, run LSTM, return next-hour prediction.'''
    load_model()
    query = f'''
        SELECT solar_production_kw, consumption_kw, battery_soc_percent
        FROM energy_readings
        WHERE house_id = '{house_id}'
        ORDER BY timestamp DESC LIMIT {SEQUENCE_LEN}
    '''
    df = pd.read_sql(query, engine)

    if len(df) < SEQUENCE_LEN:
        # Not enough data — return persistence fallback
        last = df.iloc[0] if len(df) > 0 else None
        if last is not None:
            return {
                'house_id': house_id,
                'pred_production_kw': float(last['solar_production_kw']),
                'pred_consumption_kw': float(last['consumption_kw']),
                'fallback': True
            }
        return None

    # Reverse to chronological order
    df = df.iloc[::-1].reset_index(drop=True)
    features = df[['solar_production_kw', 'consumption_kw', 'battery_soc_percent']].values
    scaled = _scaler.transform(features)
    X = scaled.reshape(1, SEQUENCE_LEN, 3)
    pred_scaled = _model.predict(X, verbose=0)[0]

    # Inverse transform (only first 2 features)
    dummy = np.zeros((1, 3))
    dummy[0, :2] = pred_scaled
    pred = _scaler.inverse_transform(dummy)[0]

    return {
        'house_id': house_id,
        'pred_production_kw': round(float(pred[0]), 3),
        'pred_consumption_kw': round(float(pred[1]), 3),
        'fallback': False
    }
