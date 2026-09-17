#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A app.worker worker --loglevel=info -Q default,thumbnail_queue,ai_queue,upload_queue,export_queue &

# Start Celery beat scheduler in the background
echo "Starting Celery beat..."
celery -A app.worker beat --loglevel=info &

# Start FastAPI application in the foreground
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
