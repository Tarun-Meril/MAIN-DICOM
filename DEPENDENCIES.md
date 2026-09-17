# MedView PRO DICOM Workstation - Dependency Report

This document cataloges every production and development package utilized across the repository, categorized by project modules.

---

## 1. MedView PRO DICOM Viewer (Frontend Node App)

### Production Dependencies
- **react (`^19.2.7`)**: UI component framework.
- **react-dom (`^19.2.7`)**: Renders React components in DOM.
- **lucide-react (`^1.21.0`)**: Modern SVG icons suite.

### Development Dependencies
- **electron (`^34.0.0`)**: Desktop shell runtime wrapper.
- **electron-builder (`^25.1.8`)**: Packages application binaries.
- **vite (`^8.1.0`)**: Local compiler and asset developer server.
- **@vitejs/plugin-react (`^6.0.3`)**: Integrates React HMR compilation into Vite.
- **tailwindcss (`^4.3.1`) & @tailwindcss/vite (`^4.3.1`)**: Utility-first CSS compiler.
- **typescript (`^6.0.3`)**: Static TypeScript compiler.
- **@types/react (`^19.2.17`) & @types/react-dom (`^19.2.3`)**: Typing bindings.
- **concurrently (`^9.1.2`)**: Runs Vite and Electron parallelly.
- **cross-env (`^7.0.3`)**: Injects environment flags across platforms.

---

## 2. MedView PRO Viewer Backend (Python FastAPI)

### Core Framework & Server
- **fastapi (`>=0.110.0`)**: Asynchronous API framework.
- **uvicorn[standard] (`>=0.28.0`)**: High-performance ASGI server.
- **pydantic (`>=2.6.0`) & pydantic-settings (`>=2.2.0`)**: Data parsing and configuration.

### Relational Database
- **sqlalchemy (`>=2.0.0`)**: Relational database ORM engine.
- **psycopg2-binary (`>=2.9.0`)**: PostgreSQL relational DB driver.
- **alembic (`>=1.13.0`)**: Tracks database migrations.

### Imaging & Processing
- **pydicom (`>=2.4.0`)**: DICOM file header and pixel array parser.
- **Pillow (`>=10.0.0`)**: Compresses gray levels into PNG images.
- **numpy (`>=1.24.0`)**: Handles raw multi-dimensional matrix operations.

### Task Processing & Caching
- **redis (`>=5.0.0`)**: In-memory caching and Redis task queue store.
- **celery (`>=5.3.0`)**: Manages asynchronous queues and scheduled beat routines.

### Security, WebSockets & Utilities
- **python-jose[cryptography] (`>=3.3.0`)**: Generates JWT authentication tokens.
- **passlib[bcrypt] (`>=1.7.4`)**: Hashes secure passwords.
- **python-multipart (`>=0.0.9`)**: Parses uploaded form-data.
- **prometheus-client (`>=0.20.0`)**: Collects Prometheus metrics.
- **websockets (`>=12.0`)**: Low-level WebSocket support.
- **python-dotenv (`>=1.0.1`)**: Loads `.env` configuration files.
- **email-validator (`>=2.0.0`)**: Checks email formatting rules.

---

## 3. PACS Study Browser (Frontend Node App)

### Production Dependencies
- **react (`^18.3.1`)**: Core rendering framework.
- **react-dom (`^18.3.1`)**: Handles web layout mounts.
- **lucide-react (`^0.344.0`)**: Icon suite for study records.

### Development Dependencies
- **vite (`^5.3.1`) & @vitejs/plugin-react (`^4.3.1`)**: Compile workflow.
- **typescript (`^5.2.2`)**: TypeScript checker.

---

## 4. PACS Study Browser Backend (Node Express App)

### Production Dependencies
- **express (`^4.19.2`)**: Server framework.
- **cors (`^2.8.5`)**: Cross-Origin requests enablement.
- **multer (`^1.4.5-lts.1`)**: Temporary form file upload handler.
- **dicom-parser (`^1.8.21`)**: Basic DICOM header extraction.

### Development Dependencies
- **ts-node-dev (`^2.0.0`)**: Dynamic hot-reloaded TypeScript node execution.
- **typescript (`^5.3.3`)**: Local TypeScript build engine.
- **@types/***: Type bindings for Express, Multer, Cors, and Node.
