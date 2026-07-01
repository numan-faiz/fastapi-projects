#!/bin/bash
# Pizza backend watchdog - keeps uvicorn running on port 8000
BACKEND_DIR="/home/z/my-project/mini-services/backend"
LOG="/tmp/pizza-backend.log"
VENV="/home/z/.venv/bin"

while true; do
  # Check if port 8000 is responding (not just open)
  HEALTHY=0
  if command -v curl &>/dev/null; then
    curl -s --max-time 3 "http://127.0.0.1:8000/docs" >/dev/null 2>&1 && HEALTHY=1
  fi
  
  if [ "$HEALTHY" -eq 0 ]; then
    # Kill zombie if port is open but not responding
    pkill -f "uvicorn main:app" 2>/dev/null
    sleep 1
    
    echo "[$(date)] Starting backend..." >> "$LOG"
    cd "$BACKEND_DIR" && "$VENV/python3" -m uvicorn main:app --host 127.0.0.1 --port 8000 >> "$LOG" 2>&1 &
    echo "[$(date)] Started with PID $!" >> "$LOG"
    
    # Wait for it to be healthy
    for i in $(seq 1 15); do
      sleep 1
      if curl -s --max-time 2 "http://127.0.0.1:8000/docs" >/dev/null 2>&1; then
        echo "[$(date)] Backend is healthy" >> "$LOG"
        break
      fi
    done
  fi
  
  sleep 10
done