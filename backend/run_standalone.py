#!/usr/bin/env python3
"""
EcoSync Standalone Runner
Runs the FastAPI backend with an in-memory building simulator.
No MQTT broker required — all data is generated and served in-process.
"""
import os
import sys
import math
import random
import asyncio
import threading
import time
from datetime import datetime

# Fix Windows console encoding for emoji
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import uvicorn


# ---------------------------------------------------------------------------
# In-memory building simulator (no MQTT)
# ---------------------------------------------------------------------------
class InMemoryBuilding:
    """Lightweight building simulator that does not need MQTT."""

    def __init__(self, building_id: int, building_type: str, base_load: float,
                 solar_capacity: float, battery_capacity: float):
        self.building_id = building_id
        self.building_type = building_type
        self.base_load = base_load
        self.solar_capacity = solar_capacity
        self.battery_capacity = battery_capacity

        # State
        self.battery_soc = random.uniform(30.0, 80.0)
        self.current_load = base_load
        self.solar_generation = 0.0
        self.grid_frequency = 50.0
        self.is_selling = False
        self.is_buying = False
        self.is_critical = False
        self.is_priority = building_type in ("hospital", "datacenter", "emergency")
        self.cloud_cover_active = False

    # --- simulation helpers ------------------------------------------------
    def tick(self):
        """Advance the simulation by one step (~5 s)."""
        hour = datetime.now().hour

        # Solar generation
        if 6 <= hour <= 18:
            time_factor = max(0, 1 - ((hour - 12) / 6) ** 2)
        else:
            time_factor = 0
        time_factor = max(0, min(1, time_factor + np.random.normal(0, 0.1)))
        self.solar_generation = max(0, self.solar_capacity * time_factor)
        if self.cloud_cover_active:
            self.solar_generation *= 0.2

        # Load
        if self.building_type == "residential":
            if 7 <= hour <= 9 or 18 <= hour <= 22:
                lf = 1.5
            elif 0 <= hour <= 5:
                lf = 0.3
            else:
                lf = 0.8
        elif self.building_type == "commercial":
            lf = 1.8 if 9 <= hour <= 17 else 0.2
        elif self.building_type == "hospital":
            lf = 1.2 + np.random.normal(0, 0.1)
        elif self.building_type == "datacenter":
            lf = 2.0 + 0.3 * math.sin(hour * math.pi / 12)
        elif self.building_type == "emergency":
            lf = 1.0 + np.random.normal(0, 0.05)
        else:
            lf = 1.0
        self.current_load = max(10, self.base_load * lf + np.random.normal(0, self.base_load * 0.05))

        # Battery
        net = self.solar_generation - self.current_load
        energy_kwh = net * (5 / 3600)
        soc_change = (energy_kwh * 0.95 / self.battery_capacity) * 100
        self.battery_soc = max(0, min(100, self.battery_soc + soc_change))

        critical_threshold = 30 if self.is_priority else 15
        self.is_critical = self.battery_soc < critical_threshold
        if self.battery_soc > 80 and net > 0:
            self.is_selling, self.is_buying = True, False
        elif self.battery_soc < 30 and net < 0:
            self.is_selling, self.is_buying = False, True
        else:
            self.is_selling = self.is_buying = False

    def telemetry(self) -> dict:
        return {
            "building_id": self.building_id,
            "timestamp": datetime.now().isoformat(),
            "load": round(self.current_load, 2),
            "solar_generation": round(self.solar_generation, 2),
            "battery_soc": round(self.battery_soc, 2),
            "grid_frequency": round(self.grid_frequency, 2),
            "is_selling": self.is_selling,
            "is_buying": self.is_buying,
            "is_critical": self.is_critical,
            "is_priority": self.is_priority,
            "building_type": self.building_type,
            "net_energy": round(self.solar_generation - self.current_load, 2),
        }


def create_buildings(n: int = 50):
    """Create a diverse set of buildings."""
    buildings = []
    cfgs = [
        (1, "hospital", 500.0, 300.0, 2000.0),
        (2, "datacenter", 800.0, 400.0, 3000.0),
        (3, "emergency", 200.0, 150.0, 800.0),
    ]
    for i in range(4, 16):
        cfgs.append((i, "commercial", random.uniform(100, 300),
                      random.uniform(50, 200), random.uniform(200, 800)))
    for i in range(16, 46):
        cfgs.append((i, "residential", random.uniform(20, 80),
                      random.uniform(30, 100), random.uniform(50, 300)))
    for i in range(46, min(n + 1, 51)):
        cfgs.append((i, "mixed", random.uniform(50, 150),
                      random.uniform(40, 150), random.uniform(100, 500)))
    for bid, btype, bl, sc, bc in cfgs:
        buildings.append(InMemoryBuilding(bid, btype, bl, sc, bc))
    return buildings


# ---------------------------------------------------------------------------
# Agent-log generator  (simulates AI agent thought logs)
# ---------------------------------------------------------------------------
AGENT_ACTIONS = [
    "Analyzing energy surplus - considering sell order",
    "Battery SoC below threshold - initiating buy request",
    "Negotiating P2P trade with building",
    "Evaluating market price vs. grid price",
    "Executing energy trade - settlement pending",
    "Monitoring solar forecast for next interval",
    "Switching to island mode - grid instability detected",
    "Optimizing battery charge/discharge schedule",
    "Trade completed successfully",
    "Adjusting bid price based on demand curves",
]


def generate_agent_log(buildings: list) -> dict:
    b = random.choice(buildings)
    action = random.choice(AGENT_ACTIONS)
    state = "selling" if b.is_selling else "buying" if b.is_buying else "balanced"
    if b.is_critical:
        state = "critical"

    # Map state to the frontend's expected log type
    type_map = {
        "selling": "success",
        "buying": "warning",
        "critical": "critical",
        "balanced": "info",
    }

    return {
        "agent_id": b.building_id,
        "building_type": b.building_type,
        "timestamp": datetime.now().isoformat(),
        "message": f"Building {b.building_id} ({b.building_type}) - {action}",
        "type": type_map.get(state, "info"),
        "state": state,
        "battery_soc": round(b.battery_soc, 1),
        "net_energy": round(b.solar_generation - b.current_load, 2),
    }


# ---------------------------------------------------------------------------
# Background simulator loop
# ---------------------------------------------------------------------------
async def simulation_loop(buildings: list):
    """Run the simulator and feed data into the API's in-memory stores."""
    # lazy import so the module is already on sys.path
    from api.main import building_data, agent_logs, manager, main_loop

    tick = 0
    while True:
        for b in buildings:
            b.tick()
            t = b.telemetry()
            building_data[b.building_id] = t

            # Broadcast via WebSocket
            loop = main_loop
            if loop and loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    manager.broadcast({"type": "telemetry", "data": t}), loop
                )

        # Generate a few agent logs each cycle
        for _ in range(random.randint(1, 3)):
            log_entry = generate_agent_log(buildings)
            agent_logs.append(log_entry)
            if len(agent_logs) > 500:
                agent_logs.pop(0)
            loop = main_loop
            if loop and loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    manager.broadcast({"type": "agent_log", "data": log_entry}), loop
                )

        tick += 1
        await asyncio.sleep(5)


# ---------------------------------------------------------------------------
# Patch the API lifespan so MQTT failure is non-fatal
# ---------------------------------------------------------------------------
def patch_api():
    """Replace the lifespan so it doesn't crash without MQTT."""
    from contextlib import asynccontextmanager
    import api.main as api_mod

    buildings = create_buildings(50)

    @asynccontextmanager
    async def standalone_lifespan(app):
        api_mod.main_loop = asyncio.get_running_loop()
        print("")
        print("=" * 70)
        print("  EcoSync Standalone Backend (no MQTT required)")
        print("=" * 70)
        print("")

        # Try MQTT but don't crash if unavailable
        try:
            api_mod.mqtt_client.on_connect = api_mod.on_mqtt_connect
            api_mod.mqtt_client.on_message = api_mod.on_mqtt_message
            api_mod.mqtt_client.connect(
                api_mod.mqtt_config.broker_host,
                api_mod.mqtt_config.broker_port, 60
            )
            api_mod.mqtt_client.loop_start()
            print("[OK] MQTT connected (external broker)")
        except Exception as e:
            print(f"[WARN] MQTT unavailable ({e}) -- using in-memory simulator")

        # Start in-memory simulator
        sim_task = asyncio.create_task(simulation_loop(buildings))
        print(f"[OK] In-memory simulator started with {len(buildings)} buildings")
        print(f"[OK] API server listening on http://0.0.0.0:8000")
        print(f"[OK] WebSocket available at ws://localhost:8000/ws")
        print("")

        yield

        sim_task.cancel()
        try:
            api_mod.mqtt_client.loop_stop()
            api_mod.mqtt_client.disconnect()
        except Exception:
            pass

    api_mod.app.router.lifespan_context = standalone_lifespan


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    patch_api()
    from api.main import app
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
