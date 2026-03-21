# 🌿 EcoSync - Smart City Energy Microgrid

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A next-generation smart city energy management system featuring AI-powered peer-to-peer energy trading, real-time 3D digital twin visualization, and blockchain-based settlement.**

![EcoSync Dashboard](https://via.placeholder.com/800x400/0f172a/10b981?text=EcoSync+3D+Digital+Twin)

## 🚀 Live Demo

**Frontend**: 
https://ecosync-nu.vercel.app/

## ✨ Features

### 🔌 Virtual IoT Layer
- **50 Simulated Smart Buildings** with realistic energy patterns
- **MQTT-based telemetry** with 5-second update intervals
- **Building types**: Hospital 🏥, Data Center 🖥, Emergency 🚨, Commercial 🏢, Residential 🏠
- **Realistic simulation**: Solar generation curves, battery dynamics, load variations
- **Grid events**: Cloud cover ☁️ (80% solar reduction), Grid failures 🚨 (island mode)
- **Gaussian noise injection** for sensor realism

### 🧠 AI Orchestration (LangGraph)
- **Multi-agent system** - each building is an autonomous AI agent
- **State machine**: Analyze → Check Price → Negotiate → Execute
- **Thought logs** visible in real-time terminal feed
- **Autonomous trading decisions** based on battery SoC, market prices, and building priorities
- **P2P negotiation** between buyer and seller agents

### 🎨 3D Digital Twin (Three.js + React)
- **Interactive 3D city grid** with 50 buildings
- **Real-time heatmap**: 
  - 🟢 Green - Selling energy
  - 🟡 Amber - Buying energy
  - 🔴 Red - Critical (low battery)
  - 🟣 Purple - Priority building
- **Building selection** with detailed info panel
- **Energy flow particles** and neon glow effects
- **Orbit controls** for 360° exploration
- **Dark theme with neon emerald accents**

### 📊 Analytics Dashboard
- **Grid efficiency metrics** vs traditional grid
- **Load vs Generation** real-time charts
- **Battery SoC distribution** across all buildings
- **Building status pie chart**
- **Market statistics**: Price, active sellers/buyers, critical buildings

### 💰 Blockchain Settlement (Solidity)
- **EcoToken (ECO)** ERC-20 smart contract
- **P2P energy trading** with automated settlement
- **ZKP verification** placeholder for energy proof
- **Oracle-based validation** system

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  3D City     │  │  Analytics   │  │  Terminal Logs       │  │
│  │  (Three.js)  │  │  (Recharts)  │  │  (WebSocket)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ WebSocket / HTTP
┌─────────────────────────────────────────────────────────────────┐
│                    API BRIDGE (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  REST API    │  │  WebSocket   │  │  MQTT Client         │  │
│  │  Endpoints   │  │  Handler     │  │  Bridge              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ MQTT
┌─────────────────────────────────────────────────────────────────┐
│                   IOT SIMULATOR (Python)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  50 Building │  │  Grid Events │  │  MQTT Publisher      │  │
│  │  Simulators  │  │  Controller  │  │  (paho-mqtt)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Agent Messages
┌─────────────────────────────────────────────────────────────────┐
│              AI ORCHESTRATION (LangGraph)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Building    │  │  State       │  │  Negotiation         │  │
│  │  Agents      │  │  Machine     │  │  Engine              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Smart Contract Calls
┌─────────────────────────────────────────────────────────────────┐
│            BLOCKCHAIN (Solidity/Ethereum)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  EcoToken    │  │  Marketplace │  │  ZKP Verification    │  │
│  │  (ERC-20)    │  │  Contract    │  │  (Placeholder)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Python 3.9+**
- **FastAPI** - Modern web framework
- **paho-mqtt** - MQTT client for IoT simulation
- **LangGraph** - Multi-agent orchestration
- **WebSockets** - Real-time frontend communication

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js + React Three Fiber** - 3D visualization
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Blockchain
- **Solidity 0.8.19** - Smart contract language
- **ERC-20** - Token standard

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- MQTT Broker (Mosquitto)

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/ecosync.git
cd ecosync
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd app
npm install
npm run build
```

### 4. Start MQTT Broker
```bash
# Using Docker
docker run -d -p 1883:1883 eclipse-mosquitto:2

# Or using your system's package manager
```

## 🚀 Running the System

### 🐳 Running with Docker (Seamless Cross-PC Deployment)

To run the entire simulated smart grid seamlessly across multiple PCs without installing Node.js or Python, use Docker Compose! This spins up the MQTT Broker, Python Backend, and React Frontend automatically proxying requests.

```bash
docker-compose up --build
```

**Accessing from any PC on the network:**
Find the IP address of the host machine (e.g., `192.168.1.5`). 
Other PCs can view the live simulation seamlessly by navigating to:
- **Dashboard**: `http://<HOST_IP>:8080/`
*(Note: WebSockets and API calls will automatically dynamically route to the host via internal Vite proxy, avoiding CORS and localhost loopback issues!)*

### Option 2: Using the Startup Script
```bash
./start.sh
```

### Option 3: Manual Start

#### Terminal 1: Start MQTT Broker
```bash
docker run -d -p 1883:1883 -p 9001:9001 eclipse-mosquitto:2
```

#### Terminal 2: Start Backend
```bash
cd backend
python main.py --api --buildings 50
```

#### Terminal 3: Serve Frontend
```bash
cd app
cd dist
python -m http.server 80
```

## 📡 API Documentation

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/api/buildings` | GET | All building telemetry |
| `/api/buildings/{id}` | GET | Specific building |
| `/api/market/status` | GET | Market statistics |
| `/api/grid/events` | GET | Recent grid events |
| `/api/trade` | POST | Execute P2P trade |
| `/api/analytics/summary` | GET | Grid analytics |
| `/api/agents/logs` | GET | AI agent logs |
| `/api/trades` | GET | Recent trades |

### WebSocket

Connect to `ws://localhost:8000/ws` for real-time updates:
- Building telemetry
- Agent thought logs
- Trade notifications
- Grid events

### MQTT Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `ecosync/building/{id}/telemetry` | Pub | Building state |
| `ecosync/grid/events` | Pub/Sub | Grid-wide events |
| `ecosync/agents/{id}/logs` | Pub | Agent thought logs |
| `ecosync/market/trades` | Pub | Trade notifications |

## 🎮 Usage Guide

### View 3D City
Open the frontend to see the 3D digital twin. Buildings change color based on their status:
- 🟢 **Green** - Selling energy
- 🟡 **Amber** - Buying energy
- 🔴 **Red** - Critical (low battery)
- 🟣 **Purple** - Priority building

### Monitor Agent Logs
Watch the terminal at the bottom to see AI agents making trading decisions in real-time.

### View Analytics
The sidebar shows:
- Grid efficiency metrics
- Load vs generation charts
- Battery levels
- Market statistics

### Trigger Grid Events
```bash
# Trigger cloud cover (reduces solar by 80%)
curl -X POST "http://localhost:8000/api/grid/event" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "cloud_cover", "intensity": 0.8, "duration": 30}'

# Trigger grid failure
curl -X POST "http://localhost:8000/api/grid/event" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "grid_failure", "duration": 60}'

# Update market price
curl -X POST "http://localhost:8000/api/grid/event" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "price_update", "price": 0.20}'
```

### Execute Manual Trade
```bash
curl -X POST "http://localhost:8000/api/trade" \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_id": 5,
    "seller_id": 12,
    "amount": 25.5,
    "price": 0.15
  }'
```

## 🏆 Hackathon Demo Tips

### Pitch Points
1. **"Digital Twin First"** - Physical hardware is a bottleneck; we simulate 10,000 buildings before a single wire is laid
2. **"AI-Powered P2P Trading"** - Buildings negotiate energy prices autonomously
3. **"Real-time 3D Visualization"** - Judges can see the entire grid state at a glance
4. **"Blockchain Settlement"** - Transparent, trustless energy trading with ZKP verification

### Live Demo Flow
1. Show the 3D city with buildings trading
2. Point out agent logs showing AI decisions
3. Trigger a cloud cover event - watch solar drop
4. Show critical buildings appearing (red)
5. Watch AI agents negotiate to balance the grid
6. Show analytics comparing EcoSync vs traditional grid

## 📁 Project Structure

```
/mnt/okcomputer/output/
├── app/                      # React Frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── threejs/     # 3D visualization
│   │   │   ├── dashboard/   # Analytics charts
│   │   │   └── terminal/    # Log terminal
│   │   ├── App.tsx          # Main application
│   │   └── types/           # TypeScript types
│   ├── dist/                # Built frontend
│   └── package.json
│
├── backend/                  # Python Backend
│   ├── config/              # Configuration
│   ├── iot_simulator/       # Building simulation
│   ├── ai_orchestration/    # AI trading agents
│   ├── api/                 # FastAPI server
│   ├── contracts/           # Solidity smart contracts
│   ├── main.py              # Main entry point
│   ├── requirements.txt     # Dependencies
│   └── Dockerfile
│
├── config/                   # Docker configs
│   ├── mosquitto.conf       # MQTT broker config
│   └── nginx.conf           # Nginx config
│
├── docker-compose.yml        # Docker orchestration
├── start.sh                  # Startup script
└── README.md                 # This file
```

## 🔮 Future Enhancements

- [ ] Real hardware integration (Raspberry Pi + sensors)
- [ ] Machine learning for price prediction
- [ ] Full ZKP implementation for energy verification
- [ ] Mobile app for building managers
- [ ] Carbon credit tracking
- [ ] Integration with real energy markets
- [ ] Support for 1000+ buildings
- [ ] Weather API integration

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Built for hackathons and smart city research
- Inspired by the need for sustainable energy management
- Powered by open-source technologies

---

<p align="center">
  <strong>🌿 EcoSync - Powering the Future of Smart Cities</strong>
</p>

<p align="center">
  <a href="https://wds3taj7loudu.ok.kimi.link">Live Demo</a> •
  <a href="./BACKEND_README.md">Backend Docs</a> •
  <a href="./docker-compose.yml">Docker Setup</a>
</p>
