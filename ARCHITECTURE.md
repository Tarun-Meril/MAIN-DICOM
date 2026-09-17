# MedView PRO DICOM Workstation - Architecture & Data Flow

This document details the system architecture, component integrations, and real-time data flows of the MedView PRO DICOM Workstation.

---

## 1. High-Level Architecture Diagram

The diagram below represents how the system components communicate, starting from the PACS data repository down to the rendering viewport:

```
                  +-----------------------------+
                  |  PACS Study Browser Backend | <---+ Web Interface (Browsing)
                  |    (Node.js + JSON DB)      |
                  +-----------------------------+
                                │
                        WADO-RS / STOW-RS
                                │
                                ▼
                  +-----------------------------+
                  |     FastAPI Backend API     | <=== WebSocket Sync Hub
                  |   (Python + SQLAlchemy)     |
                  +-----------------------------+
                     │           │           │
             Postgres DB    Redis Cache  Celery Workers
                     │           │           │
                     ▼           ▼           ▼
        +-------------------------------------------------+
        |           Electron Desktop Container            |
        |                                                 |
        |   +-----------------------------------------+   |
        |   |       MedView PRO React Renderer        |   |
        |   |   - Viewport Overlay (Metadata)         |   |
        |   |   - SVG Geometry Measurement Layer      |   |
        |   +-----------------------------------------+   |
        |                        │                        |
        |             Custom CSS/SVG Filters              |
        |                        │                        |
        |                        ▼                        |
        |   +-----------------------------------------+   |
        |   |         HTML5 Render Canvas/Img         |   |
        |   +-----------------------------------------+   |
        +-------------------------------------------------+
```

---

## 2. Component Overviews

### A. PACS Simulated Registry (Port 3001 & 3005)
- Serves as the DICOM registry.
- Exposes REST endpoints to query studies, series, and instances.
- Stores metadata in a flat-file database schema (`data/db.json`) and raw `.dcm` files under `data/instances`.

### B. MedView PRO Web API (Port 8000)
- Core workflow gateway. Integrates with Celery task systems and PostgreSQL.
- Proxies requests to the PACS simulated server when loading metadata or downloading files.
- Extracts raw pixel arrays using `pydicom` and streams normalized PNG slice frames dynamically.
- Maintains WebSockets synchronization hubs to broadcast active viewport settings across nodes.

### C. Electron Desktop Shell Wrapper
- Creates a chromium desktop window without system chrome (frameless border).
- Integrates node system APIs securely (exposing safe dialog handles via context bridge).
- Runs the React bundle directly from compiled files (`dist/index.html`) or binds to the local Vite web server during development.

---

## 3. Data Flow Specification

### Step 1: Study Selection
1. A user selects a study in the **PACS Study Browser**.
2. The browser dispatches a `POST` request containing the `studyInstanceUID` to the FastAPI backend select API (`/api/studies/select`).
3. The select API broadcasts a `StudySelected` WebSocket event to all active clients (including the Electron shell).
4. If no Electron viewport is running, it spawns the Electron app dynamically in the background via subprocess.

### Step 2: Series Meta Loading
1. The Electron shell or web viewer client receives the `StudySelected` event and queries `/api/studies/{studyUid}/series` on the FastAPI server to fetch the series hierarchy.
2. The FastAPI backend queries the PACS Study Browser API for series lists, maps the keys into camelCase, caches the result in Redis, and returns the list to the viewer.
3. The viewer renders thumbnails in the left-hand filmstrip sidebar.

### Step 3: Slices Frame Streaming
1. The active viewport determines its current slice frame (middle index by default) and requests pixel data from the FastAPI server:
   `GET /api/instances/{sopInstanceUid}/pixeldata`
2. The FastAPI server fetches the raw `.dcm` file bytes from the PACS registry.
3. The server loads the byte stream using `pydicom.dcmread()`.
4. It extracts the raw `pixel_array`, identifies the targeted frame (for multi-frame files), normalizes the values, and compresses it to PNG using `Pillow`.
5. The PNG is streamed back as an image response (`image/png`).

### Step 4: Diagnostic Rendering & LUT Filter Adjustments
1. The client viewer displays the PNG slice in a standard `<img />` tag.
2. Window Width / Level operations recalculate brightness and contrast percentages. The styles are applied instantly using hardware-accelerated CSS filters:
   `filter: brightness(B) contrast(C)`
3. Pseudo-color color mapping applies SVG lookup transfers (`feComponentTransfer` mapping red, green, and blue tables) directly onto the image canvas.
