# MedView PRO DICOM Viewer - Backend Service

This is the dedicated backend service for the **MedView PRO Diagnostic Workstation**. It is built using Python 3.12+ and FastAPI, designed using Clean Architecture principles, and decouples the viewer frontend from database and PACS servers.

## Architecture Structure

```
backend/
├── app/
│   ├── api/          # Route handlers (auth, dicom, measurements)
│   ├── config/       # Pydantic global configuration settings
│   ├── database/     # DB connection and session creation
│   ├── dicom/        # DICOMweb standard integration (QIDO-RS, WADO-RS, STOW-RS)
│   ├── models/       # Database schemas (sessions, annotations, measurements)
│   ├── streaming/    # Frame decoding and pixel streams
│   └── main.py       # API bootstrap and WebSocket endpoint
├── Dockerfile        # Container setup
└── requirements.txt  # Project package dependencies
```

## Setup & Running Locally

### 1. Requirements
Ensure you have Python 3.12+ installed locally.

### 2. Installation
Create a virtual environment and install the required libraries:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Running the Service
Launch the Uvicorn development server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Interactive API Documentation
* **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
