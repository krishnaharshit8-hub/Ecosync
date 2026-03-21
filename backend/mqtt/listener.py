# backend/mqtt/listener.py
import asyncio, json, logging
import paho.mqtt.client as mqtt
from backend.config import settings
from backend.db.database import SessionLocal
from backend.db.schemas import EnergyReading
from backend.models.lstm_model import get_prediction
from datetime import datetime

logger = logging.getLogger('mqtt_listener')

async def start_mqtt_listener(manager):
    loop = asyncio.get_event_loop()

    def on_connect(client, userdata, flags, rc):
        logger.info(f'MQTT connected with code {rc}')
        client.subscribe(settings.MQTT_TOPIC)

    def on_message(client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            db = SessionLocal()
            reading = EnergyReading(
                house_id=data['house_id'],
                timestamp=datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')),
                solar_production_kw=data['solar_production_kw'],
                consumption_kw=data['consumption_kw'],
                battery_soc_percent=data['battery_soc_percent'],
                grid_connected=data.get('grid_connected', True)
            )
            db.add(reading)
            db.commit()
            db.close()

            # Broadcast to dashboard via WebSocket
            asyncio.run_coroutine_threadsafe(
                manager.broadcast({'type': 'sensor_update', 'data': data}),
                loop
            )
        except Exception as e:
            logger.error(f'Error processing MQTT message: {e}')

    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
    client.loop_start()
    logger.info('MQTT listener started')

    # Keep the coroutine alive
    while True:
        await asyncio.sleep(1)
