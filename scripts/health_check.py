# scripts/health_check.py
import subprocess, sys, socket
import requests

CHECKS = {
    'PostgreSQL (5432)': ('localhost', 5432),
    'Mosquitto MQTT (1883)': ('localhost', 1883),
    'FastAPI Backend (8000)': ('localhost', 8000),
    'React Frontend (3000)': ('localhost', 3000),
}


def check_port(host, port):
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        return True
    except (ConnectionRefusedError, TimeoutError, OSError):
        return False


print('\n=== EcoSync System Health Check ===')
all_ok = True
for name, (host, port) in CHECKS.items():
    ok = check_port(host, port)
    status = 'UP' if ok else 'DOWN'
    color = '\033[92m' if ok else '\033[91m'
    print(f'{color}{status}\033[0m {name}')
    if not ok:
        all_ok = False

# Check FastAPI is actually responding
try:
    r = requests.get('http://localhost:8000/', timeout=3)
    print(f'\033[92mAPI\033[0m FastAPI responding: {r.json()}')
except Exception as e:
    print(f'\033[91mAPI\033[0m FastAPI not responding: {e}')
    all_ok = False

print()
if all_ok:
    print('\033[92mAll systems operational. Safe to proceed.\033[0m')
else:
    print('\033[91mSome services are down. Fix before continuing.\033[0m')
    sys.exit(1)
