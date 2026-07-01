#!/bin/bash
# Start the FastAPI backend server
# This must be run from the project root

BACKEND_DIR="/home/z/my-project/mini-services/backend"
LOG_FILE="$BACKEND_DIR/server.log"

# Kill any existing backend
pkill -f "uvicorn main:app" 2>/dev/null
sleep 1

# Ensure database exists
if [ ! -f "$BACKEND_DIR/pizza.db" ]; then
  echo "Initializing database..."
  PYTHONPATH="$BACKEND_DIR" python3 "$BACKEND_DIR/init_db.py"
fi

# Start the server
echo "Starting FastAPI backend on port 8000..."
PYTHONPATH="$BACKEND_DIR" nohup python3 -m uvicorn main:app \
  --host 0.0.0.0 \
  --port 8000 \
  > "$LOG_FILE" 2>&1 &

echo "Backend PID: $!"
sleep 2

# Verify it's running
if curl -s http://127.0.0.1:8000/docs > /dev/null 2>&1; then
  echo "Backend is running on port 8000"
else
  echo "ERROR: Backend failed to start. Check $LOG_FILE"
  cat "$LOG_FILE"
  exit 1
fi