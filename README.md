# SONARIS

**AI-Powered Automated Underwater Marine Debris and Anomaly Detection**
*(Problem Statement PS 26057)*

SONARIS is an advanced dual-engine detection system designed for automated underwater sonar imagery analysis. It leverages dedicated deep learning models to identify marine debris, submerged obstacles (e.g., crab pots), and underwater pipeline infrastructure in real-time, complete with geospatial tagging and interactive telemetry dashboards.

---

## 🌊 Overview

- **Dual-Model Inference Engine**:
  - **Multiclass Model**: Detects marine debris and crab pots.
  - **Specialist Model**: Dedicated pipeline defect and anomaly detector.
- **Interactive Geospatial Intelligence**: 3D globe visualization and Leaflet maps for mapping underwater telemetry and tagged detections.
- **Full-Stack Architecture**: Modern React + Vite frontend paired with a high-performance FastAPI Python backend.

---

## 🛠️ Project Structure

```
├── backend/
│   ├── app.py                     # FastAPI REST API endpoints
│   ├── inference.py               # Dual-model inference engine wrapper
│   ├── config.yaml                # Model paths and confidence thresholds
│   ├── requirements.txt           # Python dependencies
│   └── models/active/             # Pre-trained active model weights
├── demo images/                   # Sample sonar survey images for evaluation
├── src/                           # React frontend application
│   ├── components/                # UI components & telemetry dashboards
│   └── services/                  # API client & geospatial handlers
├── index.html
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# In the root project directory:
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📊 Models & Configuration

Model weights and confidence parameters are defined in `backend/config.yaml`:
- **Marine Debris & Crab Pot Detector** (`models/active/multiclass/best.pt`)
- **Subsea Pipeline Specialist** (`models/active/pipeline/best.pt`)
