# MedView PRO DICOM Workstation - Project Structure

This document charts the folder layout and directory structure across the MedView PRO DICOM Workstation codebase.

---

## 1. Repository Layout Overview

```
c:\full dicom viewer\
├── dicom ui viewer/                  # MEDVIEW PRO DIAGNOSTIC VIEWER
│   ├── backend/                      # FastAPI Python Application
│   │   ├── app/                      # Application Source Modules
│   │   │   ├── api/                  # API routers (auth, metadata, measurements)
│   │   │   ├── auth/                 # User validation / OAuth
│   │   │   ├── config/               # Settings parsers
│   │   │   ├── database/             # SQLAlchemy connection engine
│   │   │   ├── dicom/                # Simulated DICOMweb client proxies
│   │   │   ├── models/               # SQLAlchemy DB ORM models
│   │   │   ├── schemas/              # Pydantic data schemas
│   │   │   ├── services/             # Annotation database CRUD logic
│   │   │   ├── streaming/            # Pydicom frame extraction & streaming
│   │   │   ├── main.py               # FastAPI server entry point
│   │   │   └── worker.py             # Celery background queue tasks
│   │   ├── migrations/               # Alembic database migrations
│   │   ├── alembic.ini               # Alembic tool config file
│   │   └── requirements.txt          # Python package requirements
│   │
│   ├── frontend/                     # React + Tailwind + Vite Web & Electron App
│   │   ├── electron/                 # Electron main and preload processes
│   │   │   ├── main.js               # Electron Desktop app shell coordinator
│   │   │   └── preload.cjs           # ContextBridge secure IPC interface
│   │   ├── src/                      # React application sources
│   │   │   ├── components/           # Viewports, workspaces, overlays
│   │   │   ├── types/                # TypeScript interface mappings
│   │   │   ├── App.tsx               # Workspace viewer layout router
│   │   │   └── main.tsx              # DOM bootstrapper
│   │   ├── package.json              # Client scripts & dependencies
│   │   └── vite.config.ts            # Vite compile settings
│   │
│   └── docker-compose.yml            # PostgreSQL & Redis infrastructure compose
│
└── pacs-study-browser/              # STANDALONE PACS SYSTEM
    ├── backend/                      # Express.js Server
    │   ├── src/                      # TypeScript modules
    │   │   ├── config/               # PACS AE Title and storage settings
    │   │   ├── controllers/          # CRUD controllers for upload/download
    │   │   ├── database/             # JSON flat-file database CRUD operations
    │   │   └── routes/               # Express endpoints (studies, series, instances)
    │   ├── data/                     # Flat-file database & local .dcm storage
    │   └── package.json              # Backend script files
    │
    └── frontend/                     # Dashboard Search Layout
        ├── src/                      # React App files
        │   ├── components/           # Study search filters & record tables
        │   ├── layouts/              # Study search portal frame
        │   └── App.tsx               # Launch handler dispatching POST select calls
        └── package.json              # Front-end packages
```

---

## 2. Directory Explanations

### MedView PRO DICOM Viewer (React + Electron)
- **`frontend/electron/`**: Sets up the desktop experience. Implements window controls, frameless chrome overlays, and registers file system native import dialog handlers (`dialog-open-files`, `dialog-open-folder`) triggered by the viewer frontend.
- **`frontend/src/components/`**: Exposes the modular segments of the workstation layout:
  - **`Viewport.tsx`**: Renders the image frames, applies transformation states (zoom, pan, rotation, flips), manages live mouse tool drawing actions, and draws SVG vectors.
  - **`LeftSidebar.tsx`**: Visual filmstrip containing CT/MR series thumbnails fetched from the active patient study.
  - **`RightSidebar.tsx`**: Tabular layout parsing study headers, series codes, and SOP instance numbers.
  - **`StatusBar.tsx`**: Small footer panel showing viewport details, active tools, frames, and backend connectivity flags.

### MedView PRO Backend (FastAPI)
- **`backend/app/streaming/`**: Core file handler. Employs `pydicom` to query frame arrays, extract slice indexes, normalize raw values, compress grids into PNG buffers, and stream bytes.
- **`backend/app/dicom/`**: Implements the `DicomWebClient` proxy wrapper routing calls to the simulated PACS browser on port `3001` (representing QIDO, WADO, and STOW operations).
- **`backend/app/services/`**: Holds functional managers (e.g. `measurement_service.py` and `annotation_service.py`) executing database writes/reads to PostgreSQL/SQLite databases.
- **`backend/app/worker.py`**: Boots Celery task loops executing image thumbnails, exports, and scheduled cleanup beat tasks.

### PACS Study Browser (Node Express)
- **`backend/src/database/`**: Implements an in-memory, flat-file JSON repository (`data/db.json`). Employs Node's standard file system writes to persist updates.
- **`frontend/src/`**: Multi-filter layout interface. Queries the PACS catalog, handles DICOM file uploads, and directs selection signals to the FastAPI backend API.
