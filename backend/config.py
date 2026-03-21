# backend/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    DATABASE_URL: str = "postgresql://ecosync_user:your_password@localhost:5432/ecosync_db"
    BACKEND_PORT: int = 8000
    POLYGON_RPC_URL: str = "https://rpc-mumbai.maticvigil.com"
    PRIVATE_KEY: str = "0000000000000000000000000000000000000000000000000000000000000001"
    CONTRACT_ADDRESS: str = "0x0000000000000000000000000000000000000000"
    MQTT_BROKER_HOST: str = "localhost"
    MQTT_BROKER_PORT: int = 1883
    MQTT_TOPIC: str = "ecosync/houses/#"
    JWT_SECRET: str = "dev-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    AES_KEY: str = "0" * 64  # 32 bytes as hex

    class Config:
        env_file = '.env'

settings = Settings()
