#!/bin/bash
# Keeps the pizza backend alive - run this in background alongside Next.js
BACKEND_DIR="/home/z/my-project/mini-services/backend"
VENV_BIN="/home/z/.venv/bin"
LOG="/tmp/pizza-backend.log"

export PYTHONPATH="$BACKEND_DIR"
export PATH="$VENV_BIN:$PATH"

while true; do
  # Check if backend responds
  if ! curl -s --max-time 3 "http://127.0.0.1:8000/docs" >/dev/null 2>&1; then
    # Kill any zombie
    pkill -f "uvicorn main:app" 2>/dev/null
    sleep 1
    echo "[$(date)] Restarting backend..." >> "$LOG"
    cd "$BACKEND_DIR" && python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 >> "$LOG" 2>&1 &
    echo "[$(date)] Started PID $!" >> "$LOG"
  fi
  sleep 8
done