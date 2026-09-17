# MedView PRO DICOM Workstation - Project Commands Manual

This document provides a comprehensive list of all operational commands, package scripts, build targets, and database CLI commands for the workstation components.

---

## 1. PACS Study Browser Commands

Commands are run in `c:\full dicom viewer\pacs-study-browser`.

### Dependency Installation

```powershell
# Installs root, frontend, and backend packages
npm run install:all
```

### Local Development (Hot-Reload)

```powershell
# Runs Express backend and React frontend concurrently (port 3001 and 3005)
npm run dev

# Run Express backend separately
npm run dev:backend

# Run React frontend separately
npm run dev:frontend
```

### Production Build

```powershell
# Compiles frontend and backend assets to production build folder
npm run build:all
```

---

## 2. MedView PRO DICOM Viewer Client (Frontend)

Commands are run in `c:\full dicom viewer\dicom ui viewer\frontend`.

### Dependency Installation

```powershell
npm install
```

### Local Development (Vite Client Server)

```powershell
# Launches Vite local server on port 5174
npm run dev

# Alternate script launching renderer build only
npm run dev:renderer
```

### Electron Desktop Desktop Shell Development

```powershell
# Spawns Vite local server, binds Electron wrapper shell process, and opens window
npm run dev:electron
```

### Client Compilation & Desktop Bundler Packaging

```powershell
# Compiles React TypeScript components to /dist directory
npm run build

# Compiles React files, packs Electron resources, and generates installable executable (.exe)
npm run package
```

--

---

## 3. MedView PRO API Service (Backend)

Commands are run in `c:\full dicom viewer\dicom ui viewer\backend`.

### Environment Preparation (Python Virtual Environment)

```powershell
# Create environment
python -m venv venv

# Activate environment
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### FastAPI Asynchronous Web Server Startup

```powershell
# Runs ASGI server bound to port 8000 with auto-reload enabled
uvicorn app.main:app --reload --port 8000
```

### Alembic Relational Database Migrations

```powershell
# Upgrades current SQL database (PostgreSQL or local SQLite fallback) to latest schema
alembic upgrade head
# Downgrades migrations by 1 step
alembic downgrade -1

# Automatically generates schema changes migration script based on changes in models.py
alembic revision --autogenerate -m "description_of_changes"
```

### Celery Background Queue Workers

```powershell
# Runs worker process listening to mapped task queues
celery -A app.worker worker --loglevel=info -Q default,thumbnail_queue,ai_queue,upload_queue,export_queue

# Runs Celery Beat scheduler executing periodic cleanup and monitoring jobs
celery -A app.worker beat --loglevel=info
```

---

## 4. Infrastructure & DevOps (Docker Compose)

Commands are run in `c:\full dicom viewer\dicom ui viewer`.

### Start Core Infrastructure Services (PostgreSQL, Redis, Celery)

```powershell
# Launches Postgres, Redis caching, Celery Workers, and Beat in detached mode
docker compose up -d

# Forces rebuild of Docker containers
docker compose up --build -d
```

### Log Inspection & Shutdown

```powershell
# Follow logs for all containers
docker compose logs -f

# Shut down and clean up active containers
docker compose down

# Shut down containers and remove associated volume persistent data
docker compose down -v
```

---

## 5. MedView VR Visualization Engine

Commands are run in `e:\fdc\full_pacs_dicom\full-pacs-dicom\medview-vr` or root directory:

```powershell
# From root directory:
npm run dev:vr

# Or from medview-vr directory:
cd medview-vr
npm run dev
# Starts MedView VR dev server on http://localhost:5173
```

