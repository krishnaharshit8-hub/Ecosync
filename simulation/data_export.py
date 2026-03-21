# simulation/data_export.py
# Generates 30 days of synthetic data for LSTM training
import csv, json
from simulation.solar_generator import simulate_house
import numpy as np

HOUSES = ['H1', 'H2', 'H3', 'H4', 'H5']
OUTPUT_FILE = 'simulation/training_data.csv'


def export_training_data(days=30):
    rows = []
    for day in range(days):
        battery_state = {h: 50.0 for h in HOUSES}
        for tick in range(96):  # 96 × 15min = 24 hours
            hour = (tick * 0.25) % 24
            cloud = max(0, min(1, 0.3 + np.random.normal(0, 0.1)))
            for house_id in HOUSES:
                data = simulate_house(house_id, hour, cloud,
                                      battery_state[house_id])
                battery_state[house_id] = data['battery_soc_percent']
                rows.append({
                    'house_id': house_id,
                    'day': day,
                    'hour': hour,
                    'solar_production_kw': data['solar_production_kw'],
                    'consumption_kw': data['consumption_kw'],
                    'battery_soc_percent': data['battery_soc_percent'],
                })

    with open(OUTPUT_FILE, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f'Exported {len(rows)} rows to {OUTPUT_FILE}')


if __name__ == '__main__':
    export_training_data(days=30)
