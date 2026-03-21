# backend/models/train.py
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.preprocessing import MinMaxScaler
import joblib, os
from backend.db.database import engine

SEQUENCE_LEN = 12  # 3 hours x 4 readings/hour
FEATURES = ['solar_production_kw', 'consumption_kw', 'battery_soc_percent']
TARGETS = ['solar_production_kw', 'consumption_kw']
MODEL_PATH = 'backend/models/lstm_v1.h5'
SCALER_PATH = 'backend/models/scaler.pkl'
CHECKPOINT_DIR = 'backend/models/checkpoints/'


def load_data():
    query = '''
        SELECT house_id, timestamp, solar_production_kw,
               consumption_kw, battery_soc_percent
        FROM energy_readings
        ORDER BY house_id, timestamp
    '''
    df = pd.read_sql(query, engine)
    return df


def create_sequences(df_house):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(df_house[FEATURES])
    X, y = [], []
    for i in range(SEQUENCE_LEN, len(scaled)):
        X.append(scaled[i - SEQUENCE_LEN:i])
        y.append(scaled[i, :2])  # production + consumption
    return np.array(X), np.array(y), scaler


def build_model():
    model = Sequential([
        LSTM(64, input_shape=(SEQUENCE_LEN, len(FEATURES)), return_sequences=True),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(len(TARGETS))
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model


def train():
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    df = load_data()
    all_X, all_y = [], []
    scalers = {}

    for house_id, group in df.groupby('house_id'):
        if len(group) < SEQUENCE_LEN + 10:
            continue
        X, y, scaler = create_sequences(group.reset_index(drop=True))
        all_X.append(X)
        all_y.append(y)
        scalers[house_id] = scaler

    X_all = np.concatenate(all_X)
    y_all = np.concatenate(all_y)

    # 80/20 split
    split = int(0.8 * len(X_all))
    X_train, X_val = X_all[:split], X_all[split:]
    y_train, y_val = y_all[:split], y_all[split:]

    model = build_model()
    callbacks = [
        EarlyStopping(patience=5, restore_best_weights=True),
        ModelCheckpoint(CHECKPOINT_DIR + 'best.h5', save_best_only=True)
    ]

    model.fit(X_train, y_train, validation_data=(X_val, y_val),
              epochs=50, batch_size=32, callbacks=callbacks, verbose=1)

    model.save(MODEL_PATH)
    # Save one shared scaler (train on H1 data for normalization reference)
    joblib.dump(scalers.get('H1', list(scalers.values())[0]), SCALER_PATH)
    print(f'Model saved to {MODEL_PATH}')
    print(f'Scaler saved to {SCALER_PATH}')


if __name__ == '__main__':
    train()
