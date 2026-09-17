# MedView PRO Diagnostic Workstation - Environment & Deployment Guide

This guide describes how to configure, run, and troubleshoot the MedView PRO Diagnostic Workstation development environment.

MedView PRO consists of a high-performance React frontend shell, a FastAPI gateway backend service, a PostgreSQL relational store, a Redis task broker/cache layer, Celery background queues, and an Orthanc PACS server.

---

## 📂 Project Structure

```
dicom ui viewer/
├── frontend/             # React 19 + TypeScript + Electron desktop UI
│   ├── src/              # Application code
│   ├── .env              # Loaded configurations (Vite)
│   ├── Dockerfile        # Production multi-stage build container
│   └── package.json      # Dependencies and execution scripts
│
├── backend/              # FastAPI Python 3.12+ backend gateway service
│   ├── app/              # FastAPI modules and database connection layers
│   │   ├── config/       # Pydantic environment configurations
│   │   ├── database/     # SQLAlchemy session bootstraps
│   │   ├── worker.py     # Celery tasks & scheduled beats definitions
│   │   └── main.py       # Lifespan startup check logic & health endpoints
│   ├── migrations/       # Alembic database migration scripts
│   ├── .env              # Loaded configurations (Pydantic settings)
│   ├── Dockerfile        # Backend server container
│   └── requirements.txt  # Python requirements definition
│
├── docker-compose.yml    # Development composition profile
├── docker-compose.dev.yml# Local dev-specific overrides (volume mappings)
└── docker-compose.prod.yml# Production multi-stage composition profile
```

---

## ⚙️ Environment Variables Guide

Both the frontend and backend are configured using environment files. Example profiles are loaded automatically based on execution modes.

### 🔌 Backend Environment Configuration (`backend/.env`)

Generate a `.env` file in the `backend/` folder (or copy `.env.development`). The following variables are supported:

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `MedView PRO Backend` | Display name of the API gateway. |
| `DEBUG` | `true` | Enables FastAPI auto-reload and verbose logging. |
| `SECRET_KEY` | `change-me-in-production` | Secret key for generating JWT authentication tokens. |
| `DATABASE_URL` | *None* | Override PostgreSQL connection string (takes precedence). |
| `DATABASE_HOST` | `localhost` | PostgreSQL server hostname. |
| `DATABASE_PORT` | `5432` | PostgreSQL server port. |
| `DATABASE_USER` | `postgres` | PostgreSQL connection username. |
| `DATABASE_PASSWORD` | `postgres` | PostgreSQL connection password. |
| `DATABASE_DB` | `medview_pro` | PostgreSQL target database name. |
| `REDIS_URL` | *None* | Override Redis connection string (takes precedence). |
| `REDIS_HOST` | `localhost` | Redis server hostname. |
| `REDIS_PORT` | `6379` | Redis server port. |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Redis queue broker address. |
| `CELERY_RESULT_BACKEND`| `redis://localhost:6379/1` | Redis task results backend. |
| `ORTHANC_URL` | `http://localhost:8042` | Orthanc PACS server address. |
| `ORTHANC_USERNAME` | `orthanc` | Orthanc admin username. |
| `ORTHANC_PASSWORD` | `orthanc` | Orthanc admin password. |
| `ORTHANC_DICOMWEB_PATH`| `/dicom-web` | Route configuration for QIDO/WADO/STOW. |
| `DICOMWEB_URL` | `http://localhost:8042/dicom-web`| Direct URL to the DICOMweb interface. |
| `STORAGE_PATH` | `./storage` | Directory where file backups are saved. |
| `LOGGING_LEVEL` | `INFO` | Console logger level (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |

### 🎨 Frontend Environment Configuration (`frontend/.env`)

Vite environment variables must be prefixed with `VITE_`. Generate a `.env` in the `frontend/` folder:

*   `VITE_API_BASE_URL` = `http://localhost:8000` (The FastAPI backend gateway URL)
*   `VITE_ORTHANC_URL` = `http://localhost:8042` (The Orthanc server endpoint)
*   `VITE_DICOMWEB_URL` = `http://localhost:8042/dicom-web` (The Orthanc DICOMweb endpoint)

---

## 🛠️ Startup Guide

MedView PRO supports two main execution workflows: **Manual Development** and **Docker Development**.

### 🐳 Workflow A: Docker Development (Single Command)

With Docker Desktop installed and running, spin up the entire pre-configured ecosystem (Frontend, Backend, Postgres, Redis, Orthanc, Celery, and Celery Beat) using a single command:

```bash
docker compose up
```

*   **Vite Frontend Dev Server:** Available at [http://localhost:5173](http://localhost:5173) (supports hot reload and TypeScript compilation).
*   **FastAPI API Gateway:** Available at [http://localhost:8000](http://localhost:8000) (Swagger Docs: [/docs](http://localhost:8000/docs)).
*   **Orthanc PACS Explorer:** Available at [http://localhost:8042/app/explorer.html](http://localhost:8042/app/explorer.html).
*   **PostgreSQL Database:** Bound on host port `5432`.
*   **Redis Server:** Bound on host port `6379`.
*   **Celery Workers & Beat Scheduler:** Consumes background task queues automatically.

To stop and remove containers and networks:
```bash
docker compose down
```

---

### 💻 Workflow B: Manual Local Development

If running outside Docker, you can start the individual services manually.

#### 1. Pre-requisites
Ensure PostgreSQL (port 5432) and Redis (port 6379) are started on your system. Orthanc PACS should also be running on port 8042.

#### 2. Run Database Migrations (Alembic)
Apply the relational schema to your database:
```bash
cd backend
alembic upgrade head
```

#### 3. Run FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 4. Run Celery Worker
Start the worker listening on all required queues (AI queue, thumbnail generation, upload, and export):
```bash
cd backend
celery -A app.worker worker --loglevel=info -Q default,thumbnail_queue,ai_queue,upload_queue,export_queue
```

#### 5. Run Celery Beat Scheduler
Start Celery Beat to trigger cache cleanups and health checks:
```bash
cd backend
celery -A app.worker beat --loglevel=info
```

#### 6. Run React Frontend (Vite + Electron)
Install dependencies and run concurrently in development mode (which starts the Vite dev server on port 5173 and boots the Electron window wrapper):
```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Health Checks & Startup Validations

### 🎯 API Diagnostics Endpoint (`GET /api/health`)

FastAPI offers a detailed diagnostics endpoint returning structural status metrics about every integrated dependency:

```bash
curl http://localhost:8000/api/health
```

Example JSON response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "backend": "healthy",
  "services": {
    "postgres": { "connected": true, "message": "Connected" },
    "redis": { "connected": true, "message": "Connected" },
    "orthanc": { "connected": true, "message": "Connected" },
    "celery": { "connected": true, "message": "Running" },
    "migrations": { "complete": true, "message": "Up-to-date" },
    "api": { "ready": true, "message": "Ready" }
  }
}
```

### 🖥️ Frontend Startup Validation Overlay

When the React frontend boots up, a premium glassmorphic diagnostics dashboard blocks workspace loading until all required services are verified healthy:

1.  **System Integration Checks:** Lists real-time connection status for PostgreSQL, Redis, Orthanc, Celery, Alembic Migrations, and FastAPI.
2.  **Startup Verification Log:** Outputs terminal console logs line-by-line:
    *   `✓ PostgreSQL Connected`
    *   `✓ Redis Connected`
    *   `✓ Orthanc Connected`
    *   `✓ Celery Started`
    *   `✓ FastAPI Started`
    *   `✓ React Started`
    *   `Application Ready`
3.  **Error Notifications:** If any backend check fails, it highlights the offline service, provides error descriptions, logs the trace, and exposes a manual **Force Retry** button.

---

## 🔍 Troubleshooting Guide

#### ✕ PostgreSQL: FATAL database "medview_pro" does not exist
By default, PostgreSQL does not create databases automatically when connecting.
*   **Docker:** Postgres is pre-configured to build the database automatically in `docker-compose.yml`.
*   **Manual:** Run the creation helper script in the backend directory before running migrations:
    ```bash
    python create_db.py
    ```

#### ✕ Alembic: FileNotFoundError migrations/script.py.mako
If you receive template errors generating migrations:
*   Verify that `migrations/script.py.mako` is present in your folder. If not, copy it from the template or recreate the versions subdirectory (`migrations/versions/`).

#### ✕ Celery: Warning "No active Celery workers detected"
FastAPI will report a warning if Celery is started but no active worker nodes are connected.
*   Verify that the redis cache is running.
*   Ensure that the Celery process is running:
    `celery -A app.worker worker --loglevel=info`
*   Verify that worker is consuming from the correct broker URL configured in `.env`.

#### ✕ Orthanc: Connection Failed (Status 401)
*   Check if your credentials `ORTHANC_USERNAME` and `ORTHANC_PASSWORD` in the backend `.env` match the configurations in your Orthanc server (`orthanc.json` configuration).

#### ✕ Vite: Address already in use
*   If port 5173 is already in use by another process, Vite will throw a port conflict. Free the port or configure `vite.config.ts` to map to a different port.
