# MedView PRO DICOM Viewer & PACS Browser - Technology Stack

This document presents a comprehensive, verified audit of all technologies, frameworks, libraries, utilities, and services used across the MedView PRO DICOM Workstation project.

---

## 1. Frontend Technology Stack

### MedView PRO DICOM Viewer (Frontend)
- **React (v19.2.7)**: Core component rendering framework.
- **TypeScript (v6.0.3)**: Provides static typing and IDE safety.
- **Vite (v8.1.0)**: Modern build tool and developer web server.
- **Tailwind CSS (v4.3.1)**: Utility-first CSS styling via the new `@tailwindcss/vite` compiler.
- **Lucide React (v1.21.0)**: Icon suite for the viewer interface.

### PACS Study Browser (Frontend)
- **React (v18.3.1)**: Standalone user interface core.
- **TypeScript (v5.2.2)**: Static type safety.
- **Vite (v5.3.1)**: Development server and compiler.
- **Lucide React (v0.344.0)**: Dashboard interfaces and table icon assets.

---

## 2. DICOM & Medical Imaging Stack

### Image Decoding & Processing (Backend)
- **pydicom (v2.4.0)**: Used in the Python backend to read raw DICOM file bytes, parse dataset headers, extract pixel arrays, and navigate multi-frame slices.
- **dicom-parser (v1.8.21)**: Lightweight Node.js library used in the PACS Study Browser backend to extract header tags during import.
- **Pillow (v10.0.0) & NumPy (v1.24.0)**: Processes raw floating-point pixel values, normalizes them to an 8-bit unsigned integer range (0-255), and compresses them into high-performance PNG image buffers streamed directly to the frontend.

### Rendering & Transformations (Client-side)
- **Custom HTML5 Canvas & Image Wrapper**: Uses high-performance HTML overlay rendering. Reuses cached browser image loads via direct `/pixeldata` queries.
- **CSS Filters**: Applies dynamic window width (contrast) and window center (brightness) adjustments directly on the DOM image using `brightness()` and `contrast()` rules, alongside `invert(1)` for image grayscale inversion.
- **SVG Color Matrix Filters**: Natively implements lookup tables (LUTs) inside `<svg>` nodes (`feComponentTransfer`) to map grayscale values to pseudo-color representations (Hot Iron, Rainbow/PET) in real time.

### DICOMweb Abstraction
- **DicomWebClient**: Custom asynchronous module implementing equivalent behaviors for standard DICOMweb interfaces:
  - **QIDO-RS**: Proxies queries to `/api/studies` and `/api/studies/{uid}/series`.
  - **WADO-RS / WADO-URI**: Streams parsed instances via `/api/instances/{uid}/pixeldata` or exports files via `/api/instances/{uid}/file`.
  - **STOW-RS**: Uploads multi-part frames to `/api/studies/upload`.

---

## 3. PACS Architecture

- **Study Query & Retrieve**: The PACS Study Browser backend simulates a DICOM registry, keeping metadata cataloged in a local JSON storage file.
- **Multi-Frame Support**: Multi-frame DICOM files are parsed on the fly. The viewer can scroll through individual frame dimensions by changing the `frame` index parameter in the pixeldata API.
- **Cache Management**: Celery beat schedules trigger cached image cleanup routines (`cleanup_cache` task running every hour) to purge temporary imports.

---

## 4. Backend Technology Stack

### MedView PRO Viewer Backend
- **FastAPI (v0.110.0+)**: Highly performant, modern asynchronous Python web framework.
- **Uvicorn (v0.28.0+)**: ASGI server implementing standard HTTP/WebSockets gateway.
- **Python (>= 3.10)**: Core backend programming language.

### PACS Study Browser Backend
- **Express.js (v4.19.2)**: Lightweight Node.js server.
- **TypeScript (v5.3.3) & ts-node-dev (v2.0.0)**: Transpiles Node.js processes dynamically during development.

---

## 5. Database Technology

### Production Relational Store (Viewer Backend)
- **PostgreSQL (v16-alpine)**: Standard relational database used in containerized production.
- **SQLAlchemy (v2.0.0+)**: Object-Relational Mapper (ORM) managing sessions and models.
- **Alembic (v1.13.0+)**: Handles incremental database migrations and schema syncing.
- **SQLite Fallback**: Integrates an automatically routed local fallback database (`sqlite:///./medview_pro.db`) if no PostgreSQL instance is found during development.

### Message Broker & Cache (Viewer Backend)
- **Redis (v7-alpine)**: Acts as the message broker for Celery queues and results storage (`redis://localhost:6379/1`). Exposes caching services for high-speed endpoints.

### PACS Simulated Database
- **Custom JSON Store (`db.json`)**: An in-memory, file-synchronized database structured as a JSON file, read and written using Node.js filesystem APIs.

---

## 6. Electron Desktop Stack

- **Electron (v34.0.0)**: Core desktop shell application wrapper.
- **Electron Builder (v25.1.8)**: Packages, codesigns, and bundles installers for Windows (`nsis`).
- **Inter-Process Communication (IPC)**: Exposes endpoints to control frameless chrome actions (`window-minimize`, `window-maximize`, `window-close`) and trigger OS dialogs.
- **Context Isolation & Preload Scripts**: Exposes secure APIs to the renderer window through a CommonJS preload bridge (`preload.cjs`), keeping `nodeIntegration` disabled for security.

---

## 7. State Management & Routing

- **State Management**: Uses standard React Hooks (`useState`, `useRef`, `useMemo`) and React Context. Avoids bulky external stores, keeping state changes lightweight and local to viewports.
- **Routing**: Implements custom routing in React. Resolves layout paths (e.g. `/viewer/{studyUid}`) and conditional sidebar overlays dynamically.

---

## 8. API & Communication Layers

- **REST API (Fetch API)**: Queries database, uploads, and fetches study details.
- **WebSockets (`/ws/viewer` and `/ws/session`)**: Broadcasters synchronization data (active slice, pan, zoom, contrast) to all connected peers in real time, enabling collaborative diagnostic views.
- **Celery Tasks**: Orchestrates background actions:
  - `thumbnail_queue` (Thumbnail Generation)
  - `ai_queue` (AI Pathology Detection)
  - `upload_queue` (PACS Storage Import)
  - `export_queue` (DICOM Study Archive Packaging)
