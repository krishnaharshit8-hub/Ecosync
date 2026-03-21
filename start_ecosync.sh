#!/bin/bash
# Master startup script for EcoSync
# Run from project root: bash start_ecosync.sh
set -e  # Exit on any error

GREEN='\033[92m' NC='\033[0m'
log() { echo -e "${GREEN}[EcoSync]${NC} $1"; }

log 'Starting EcoSync System...'

# 1. MQTT
log 'Starting Mosquitto MQTT broker...'
sudo systemctl start mosquitto
sleep 1

# 2. PostgreSQL
log 'Starting PostgreSQL...'
sudo systemctl start postgresql
sleep 1

# 3. Backend (background)
log 'Starting FastAPI backend on port 8000...'
cd backend && source ../venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
sleep 3  # Wait for backend to initialize
cd ..

# 4. Health check
log 'Running health check...'
python scripts/health_check.py || { log 'Health check failed! Aborting.'; exit 1; }

# 5. Frontend (background)
log 'Starting React frontend on port 3000...'
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

# 6. Simulation publisher (background)
log 'Starting Isaac Sim MQTT publisher...'
source venv/bin/activate
python simulation/mqtt_publisher.py &
SIM_PID=$!

log '============================================'
log 'EcoSync is running!'
log '  Dashboard: http://localhost:3000'
log '  API:       http://localhost:8000'
log '  API Docs:  http://localhost:8000/docs'
log '============================================'

# Wait for Ctrl+C
trap 'kill $BACKEND_PID $FRONTEND_PID $SIM_PID 2>/dev/null; exit' INT
wait
