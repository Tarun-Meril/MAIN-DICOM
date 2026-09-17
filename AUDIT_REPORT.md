# MedView PRO DICOM Workstation - Technical Audit Report

This document compiles the architectural audit findings of the MedView PRO DICOM Workstation project. It highlights security, performance, and scalability issues, and recommends optimizations.

---

## 1. Codebase Summary & Findings

The workstation is a hybrid desktop-cloud diagnostic visualizer. It has a lightweight design, bypassing bulky packages like Cornerstone3D by utilizing:
1. **Dynamic Backend Pixel Slicing**: Converts high-dynamic-range raw DICOM pixel arrays into standard 8-bit PNG images using `pydicom` and `Pillow` on FastAPI.
2. **GPU-Accelerated CSS Filters**: Adjusts contrast, brightness, and grayscale inversion on the client DOM in real time, avoiding canvas re-renders.
3. **SVG Vector Overlay**: Draws annotations, ROIs, and spinal Cobb angles on an SVG layer.

---

## 2. Identified Vulnerabilities & Technical Debt

### A. Security Flaws
- **Insecure JWT Default Secret**: The backend config defaults to `SECRET_KEY="your-super-secret-jwt-key-change-this-in-production"`. If this env variable is not overwritten in production, it makes user sessions vulnerable to token spoofing.
- **Permissive CORS Rules**: FastAPI CORS middleware uses `allow_origins=["*"]`. This should be locked down to the actual hostnames of the viewer.
- **Lack of Encryption**: Communication channels (REST APIs and WebSockets) use plain HTTP/WS. In clinical environments, HTTPS/WSS must be enforced to protect Protected Health Information (PHI).
- **Single-User SQLite Fallback**: While SQLAlchemy supports SQLite, concurrent SQLite writes by multiple clients (e.g., saving annotations) can result in database locks (`database is locked` exceptions).

### B. Dependency Inconsistencies
- **React Versions**: The viewer frontend uses React **19.2.7**, while the PACS Study Browser uses React **18.3.1**. Mixing major React versions complicates testing and state patterns.
- **TypeScript Versions**: TypeScript **6.0.3** (viewer frontend) is combined with **5.2.2** (PACS frontend) and **5.3.3** (PACS backend).
- **Unused Packages**: The viewer lists `@rolldown/binding-linux-x64-musl` under optional dependencies. This is unused in local Windows development and packaging workflows.

### C. Performance Bottlenecks
- **On-Demand PNG Compression**: The backend decodes DICOM pixels, normalizes arrays, and encodes PNG images on every slice change. During rapid scrolling, this causes high CPU usage.
- **High-Frequency WebSocket Broadcasts**: Panning, zooming, and window-level actions broadcast coordinates on every mouse movement. This can saturate network bandwidth.

---

## 3. Recommendations & Mitigations

### 1. Optimize Image Streaming
- **Pre-Cache/Pre-Render Slices**: Generate and cache PNG/WebP files during import.
- **Client-Side Decoding**: Stream raw pixel buffers (e.g., 16-bit Float32 arrays) and utilize WebGL shaders on the client for Window/Level adjustments. This reduces server CPU load.

### 2. Strengthen Security
- **Secure Environment Config**: Enforce a check that fails application startup if the `SECRET_KEY` is set to the default development value.
- **Restricted CORS**: Configure allowed origins based on environment profiles (e.g., locking production to the desktop shell).

### 3. Database & Storage Safety
- **Enforce PostgreSQL**: Disable the SQLite database fallback in production environments, requiring a direct PostgreSQL connection.
- **Robust Flat-File Storage**: Migrating the simulated PACS browser JSON store to an indexed database (e.g. SQLite/PostgreSQL) will prevent data loss during concurrent imports.

### 4. WebSocket Throttling
- Throttle drag events to ~30-50ms intervals before broadcasting updates to other connected clients.
