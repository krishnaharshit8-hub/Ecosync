# simulation/mqtt_publisher.py
# Run with: python simulation/mqtt_publisher.py
# Publishes simulated sensor data to MQTT every 2 seconds (real-time demo mode)
import time, json, math
import paho.mqtt.client as mqtt
import numpy as np
from simulation.solar_generator import simulate_house

BROKER = 'localhost'
PORT = 1883
HOUSES = ['H1', 'H2', 'H3', 'H4', 'H5']
TICK_INTERVAL = 2.0  # seconds per simulated 15-minute tick (fast for demo)


def run():
    client = mqtt.Client(client_id='isaac_sim_publisher')
    client.connect(BROKER, PORT, 60)
    client.loop_start()
    print(f'MQTT Publisher connected to {BROKER}:{PORT}')

    # Simulation state
    sim_hour = 6.0      # Start at 6am
    cloud_cover = 0.2   # 20% cloud cover initially
    battery_state = {h: 50.0 for h in HOUSES}  # All start at 50%
    tick = 0

    while True:
        tick += 1
        # Slowly change cloud cover
        cloud_cover = max(0, min(1, cloud_cover + np.random.normal(0, 0.02)))

        for house_id in HOUSES:
            data = simulate_house(
                house_id, sim_hour, cloud_cover, battery_state[house_id]
            )
            battery_state[house_id] = data['battery_soc_percent']

            topic = f'ecosync/houses/{house_id}'
            payload = json.dumps(data)
            client.publish(topic, payload, qos=1)

        print(f'[Tick {tick}] Hour {sim_hour:.2f} | Cloud {cloud_cover:.0%}')
        sim_hour = (sim_hour + 0.25) % 24  # Advance 15 sim-minutes
        time.sleep(TICK_INTERVAL)


if __name__ == '__main__':
    run()
