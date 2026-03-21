# simulation/solar_generator.py
import numpy as np
import math
from datetime import datetime, timedelta

HOUSE_CONFIG = {
    'H1': {'panel_kw': 5.0, 'efficiency': 0.20, 'base_consumption': 2.5},
    'H2': {'panel_kw': 4.5, 'efficiency': 0.18, 'base_consumption': 2.2},
    'H3': {'panel_kw': 6.0, 'efficiency': 0.22, 'base_consumption': 4.0},
    'H4': {'panel_kw': 8.0, 'efficiency': 0.21, 'base_consumption': 6.0},  # MedCenter
    'H5': {'panel_kw': 5.5, 'efficiency': 0.19, 'base_consumption': 2.8},
}


def solar_irradiance(hour: float, cloud_cover: float) -> float:
    '''Calculate solar irradiance (0-1) based on time of day and clouds.
    Peak at hour 12 (noon). Zero before 6am and after 7pm.
    '''
    if hour < 6 or hour > 19:
        return 0.0
    # Sine curve peaking at noon
    angle = math.pi * (hour - 6) / (19 - 6)
    base = math.sin(angle)
    cloud_factor = 1.0 - (cloud_cover * 0.8)  # Clouds reduce by up to 80%
    noise = np.random.normal(0, 0.05)  # Small random variation
    return max(0, min(1.0, base * cloud_factor + noise))


def simulate_house(house_id: str, hour: float, cloud_cover: float,
                   battery_soc: float) -> dict:
    '''Simulate one 15-minute tick for a house.'''
    cfg = HOUSE_CONFIG[house_id]
    irradiance = solar_irradiance(hour, cloud_cover)
    production = round(cfg['panel_kw'] * cfg['efficiency'] * irradiance * 5, 3)

    # Consumption: base + random peak (evening hours have higher consumption)
    evening_factor = 1.0 + 0.5 * max(0, math.sin(math.pi * (hour - 14) / 8))
    consumption = round(
        cfg['base_consumption'] * evening_factor * np.random.uniform(0.85, 1.15), 3
    )

    # Battery: simple charge/discharge model
    net = production - consumption
    battery_change = net * 0.95  # 95% charge efficiency
    new_battery = max(0, min(100, battery_soc + battery_change * 10))

    return {
        'house_id': house_id,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'solar_production_kw': production,
        'consumption_kw': consumption,
        'battery_soc_percent': round(new_battery, 1),
        'grid_connected': True,
    }
