"""
EcoSync FastAPI Backend
Real-time API with WebSocket support for the EcoSync system
"""
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

import paho.mqtt.client as mqtt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config.settings import mqtt_config, api_config

# In-memory storage for latest data
building_data: Dict[int, dict] = {}
grid_events: List[dict] = []
agent_logs: List[dict] = []
trades: List[dict] = []
market_data = {
    "current_price": 0.15,
    "trades_today": 0,
    "total_volume": 0.0,
    "grid_stability": 100.0
}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 WebSocket client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"🔌 WebSocket client disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

main_loop = None

def broadcast_safe(msg):
    if main_loop and main_loop.is_running():
        asyncio.run_coroutine_threadsafe(manager.broadcast(msg), main_loop)

# MQTT Client
mqtt_client = mqtt.Client(
    client_id="fastapi_bridge",
    callback_api_version=mqtt.CallbackAPIVersion.VERSION1
)

def on_mqtt_connect(client, userdata, flags, rc):
    """Subscribe to all building topics on connect"""
    if rc == 0:
        print("✅ MQTT Bridge: Connected to broker")
        # Subscribe to all building telemetry
        client.subscribe("ecosync/building/+/telemetry")
        # Subscribe to grid events
        client.subscribe("ecosync/grid/events")
        # Subscribe to AI agent logs
        client.subscribe("ecosync/agents/+/logs")
        # Subscribe to market trades
        client.subscribe("ecosync/market/trades")
        print("📡 MQTT Bridge: Subscribed to all topics")
    else:
        print(f"❌ MQTT Bridge: Connection failed with code {rc}")

def on_mqtt_message(client, userdata, msg):
    """Process incoming MQTT messages"""
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        
        if "telemetry" in topic:
            # Extract building ID from topic
            parts = topic.split("/")
            building_id = int(parts[2])
            
            # Add timestamp if not present
            if "timestamp" not in payload:
                payload["timestamp"] = datetime.now().isoformat()
            
            # Store in memory
            building_data[building_id] = payload
            
            # Broadcast to WebSocket clients
            broadcast_safe({
                "type": "telemetry",
                "data": payload
            })
        
        elif "grid/events" in topic:
            # Store grid event
            event_data = {
                "timestamp": datetime.now().isoformat(),
                "event": payload
            }
            grid_events.append(event_data)
            
            # Update market data if price update
            if payload.get("type") == "price_update":
                market_data["current_price"] = payload.get("price", 0.15)
            
            # Keep only last 100 events
            if len(grid_events) > 100:
                grid_events.pop(0)
            
            broadcast_safe({
                "type": "grid_event",
                "data": payload
            })
        
        elif "agents" in topic and "logs" in topic:
            # AI agent thought logs
            agent_logs.append(payload)
            
            # Keep only last 500 logs
            if len(agent_logs) > 500:
                agent_logs.pop(0)
            
            broadcast_safe({
                "type": "agent_log",
                "data": payload
            })
        
        elif "market/trades" in topic:
            # Trade execution
            trades.append(payload)
            market_data["trades_today"] += 1
            market_data["total_volume"] += payload.get("amount", 0)
            
            # Keep only last 100 trades
            if len(trades) > 100:
                trades.pop(0)
            
            broadcast_safe({
                "type": "trade",
                "data": payload
            })
    
    except Exception as e:
        print(f"⚠️ Error processing MQTT message: {e}")

# Pydantic models
class BuildingTelemetry(BaseModel):
    building_id: int
    load: float
    solar_generation: float
    battery_soc: float
    grid_frequency: float
    is_selling: bool
    is_buying: bool
    is_critical: bool
    is_priority: bool
    building_type: str
    net_energy: float
    timestamp: str

class GridEventModel(BaseModel):
    type: str
    active: bool
    intensity: Optional[float] = None
    price: Optional[float] = None
    timestamp: str

class MarketStatus(BaseModel):
    current_price: float
    trades_today: int
    total_volume: float
    grid_stability: float
    active_sellers: int
    active_buyers: int
    critical_buildings: int

class TradeRequest(BaseModel):
    buyer_id: int
    seller_id: int
    amount: float  # kWh
    price: float   # $/kWh

class GridEventTrigger(BaseModel):
    event_type: str  # cloud_cover, grid_failure, price_update
    intensity: Optional[float] = 0.8
    duration: int = 30
    price: Optional[float] = None

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    global main_loop
    main_loop = asyncio.get_running_loop()
    # Startup
    print("\n" + "="*70)
    print("  🚀 EcoSync FastAPI Backend Starting...")
    print("="*70 + "\n")
    
    # Connect to MQTT
    mqtt_client.on_connect = on_mqtt_connect
    mqtt_client.on_message = on_mqtt_message
    try:
        mqtt_client.connect(mqtt_config.broker_host, mqtt_config.broker_port, 60)
        mqtt_client.loop_start()
        print(f"✅ Connected to MQTT at {mqtt_config.broker_host}:{mqtt_config.broker_port}")
    except Exception as e:
        print(f"⚠️ MQTT connection failed: {e}")
    
    yield
    
    # Shutdown
    print("\n" + "="*70)
    print("  🛑 EcoSync FastAPI Backend Shutting down...")
    print("="*70 + "\n")
    mqtt_client.loop_stop()
    mqtt_client.disconnect()

# Create FastAPI app
app = FastAPI(
    title="EcoSync API",
    description="Smart City Energy Microgrid API - Real-time P2P energy trading with AI agents",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=api_config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "EcoSync API",
        "version": "1.0.0",
        "status": "operational",
        "features": [
            "Real-time building telemetry",
            "AI agent orchestration",
            "P2P energy trading",
            "Grid event management",
            "WebSocket streaming"
        ]
    }

@app.get("/api/buildings", response_model=List[dict])
async def get_all_buildings():
    """Get telemetry for all buildings"""
    return list(building_data.values())

@app.get("/api/buildings/{building_id}")
async def get_building(building_id: int):
    """Get telemetry for a specific building"""
    if building_id not in building_data:
        raise HTTPException(status_code=404, detail="Building not found")
    return building_data[building_id]

@app.get("/api/market/status")
async def get_market_status():
    """Get current market status"""
    active_sellers = sum(1 for b in building_data.values() if b.get("is_selling"))
    active_buyers = sum(1 for b in building_data.values() if b.get("is_buying"))
    critical = sum(1 for b in building_data.values() if b.get("is_critical"))
    
    return {
        "current_price": market_data["current_price"],
        "trades_today": market_data["trades_today"],
        "total_volume": round(market_data["total_volume"], 2),
        "grid_stability": market_data["grid_stability"],
        "active_sellers": active_sellers,
        "active_buyers": active_buyers,
        "critical_buildings": critical
    }

@app.get("/api/grid/events")
async def get_grid_events(limit: int = 10):
    """Get recent grid events"""
    return grid_events[-limit:]

@app.post("/api/grid/event")
async def trigger_grid_event(event: GridEventTrigger):
    """Manually trigger a grid event"""
    event_payload = {
        "type": event.event_type,
        "active": True,
        "timestamp": datetime.now().isoformat()
    }
    
    if event.event_type == "cloud_cover":
        event_payload["intensity"] = event.intensity
    elif event.event_type == "price_update":
        event_payload["price"] = event.price or market_data["current_price"]
    
    mqtt_client.publish("ecosync/grid/events", json.dumps(event_payload))
    
    # Schedule deactivation
    if event.duration > 0:
        await asyncio.sleep(event.duration)
        event_payload["active"] = False
        mqtt_client.publish("ecosync/grid/events", json.dumps(event_payload))
    
    return {"status": "success", "event": event_payload}

@app.post("/api/trade")
async def execute_trade(trade: TradeRequest):
    """Execute a P2P energy trade"""
    # Validate buildings exist
    if trade.buyer_id not in building_data:
        raise HTTPException(status_code=404, detail="Buyer building not found")
    if trade.seller_id not in building_data:
        raise HTTPException(status_code=404, detail="Seller building not found")
    
    # Update market data
    market_data["trades_today"] += 1
    market_data["total_volume"] += trade.amount
    
    # Publish trade to MQTT
    trade_msg = {
        "type": "trade_executed",
        "buyer_id": trade.buyer_id,
        "seller_id": trade.seller_id,
        "amount": trade.amount,
        "price": trade.price,
        "total_cost": trade.amount * trade.price,
        "timestamp": datetime.now().isoformat()
    }
    mqtt_client.publish("ecosync/market/trades", json.dumps(trade_msg))
    
    # Send commands to buildings
    mqtt_client.publish(
        f"ecosync/building/{trade.seller_id}/commands",
        json.dumps({"command": "trade_completed", "role": "seller", "amount": trade.amount})
    )
    mqtt_client.publish(
        f"ecosync/building/{trade.buyer_id}/commands",
        json.dumps({"command": "trade_completed", "role": "buyer", "amount": trade.amount})
    )
    
    # Broadcast to WebSocket
    await manager.broadcast({
        "type": "trade",
        "data": trade_msg
    })
    
    return {"status": "success", "trade": trade_msg}

@app.get("/api/analytics/summary")
async def get_analytics_summary():
    """Get grid analytics summary"""
    if not building_data:
        return {
            "total_load": 0,
            "total_generation": 0,
            "net_grid_flow": 0,
            "avg_battery_soc": 0,
            "grid_efficiency": 0,
            "building_count": 0
        }
    
    total_load = sum(b.get("load", 0) for b in building_data.values())
    total_gen = sum(b.get("solar_generation", 0) for b in building_data.values())
    avg_soc = sum(b.get("battery_soc", 0) for b in building_data.values()) / len(building_data)
    
    # Calculate grid efficiency (local consumption / total generation)
    local_consumption = sum(
        min(b.get("load", 0), b.get("solar_generation", 0))
        for b in building_data.values()
    )
    efficiency = (local_consumption / total_gen * 100) if total_gen > 0 else 0
    
    return {
        "total_load": round(total_load, 2),
        "total_generation": round(total_gen, 2),
        "net_grid_flow": round(total_load - total_gen, 2),
        "avg_battery_soc": round(avg_soc, 2),
        "grid_efficiency": round(efficiency, 2),
        "building_count": len(building_data),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/agents/logs")
async def get_agent_logs(limit: int = 100):
    """Get recent AI agent logs"""
    return agent_logs[-limit:]

@app.get("/api/trades")
async def get_trades(limit: int = 20):
    """Get recent trades"""
    return trades[-limit:]

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send current state to new client
        await websocket.send_json({
            "type": "buildings_list",
            "data": list(building_data.values())
        })
        
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                
                if action == "get_buildings":
                    await websocket.send_json({
                        "type": "buildings_list",
                        "data": list(building_data.values())
                    })
                elif action == "get_logs":
                    limit = msg.get("limit", 100)
                    await websocket.send_json({
                        "type": "logs_list",
                        "data": agent_logs[-limit:]
                    })
                elif action == "trigger_event":
                    event_type = msg.get("event_type")
                    # Handle event trigger via WebSocket
                    pass
                    
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=api_config.host,
        port=api_config.port,
        log_level="info"
    )
