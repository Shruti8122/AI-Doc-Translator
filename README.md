# Doc Translator

Document translation web app using **EasyOCR** for OCR and **NLLB-200** for translation.

## Architecture (MERN Hybrid)

```
Frontend         Backend                ML Inference
┌─────────┐     ┌──────────┐          ┌──────────┐
│  React  │────►│ Express  │─────────►│  FastAPI  │
│  (Vite) │     │ (Node.js)│  HTTP    │ (Python)  │
└─────────┘     │  +       │          │ OCR + NLLB│
       ▲        │ MongoDB  │          └──────────┘
       │        └──────────┘
       │               │
  Polls progress   File system
  via REST         (uploads/)
```

| Layer | Tech | Port |
|-------|------|------|
| **M**ongoDB | Database (tasks, progress) | 27017 |
| **E**xpress | Web server + API | 5000 |
| **R**eact | Frontend UI | 3000 (dev) |
| **N**ode.js | Runtime for Express | — |
| FastAPI (Python) | ML inference (OCR + translation) | 8000 |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.10 + Conda (for ML models)

## Quick Start

### 1. Python Environment (ML Models)

```bash
conda env create -f environment.yaml
conda activate Doc_Translator
```

### 2. Frontend

```bash
cd frontend
npm install
npm run build     # production build served by Express
# OR for development:
npm run dev       # port 3000 with proxy to Express
```

### 3. Express + MongoDB

```bash
cd backend/express
npm install
npm start         # starts on port 5000
```

### 4. Start Services

Open **3 terminals**:

| Terminal | Command | Port |
|----------|---------|------|
| 1 (FastAPI) | `uvicorn backend.fastapi_app.main:app --host 0.0.0.0 --port 8000` | 8000 |
| 2 (Express) | `cd backend/express && npm start` | 5000 |
| 3 (Frontend dev) | `cd frontend && npm run dev` | 3000 |


```

### 5. Open

Navigate to **http://localhost:3000** (dev) or **http://localhost:5000** (production).

## API Endpoints

### Express (port 5000)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/languages | List supported languages |
| POST | /api/upload | Upload PDF file |
| POST | /api/start-translation | Start OCR + translation |
| GET | /api/progress/:taskId | Poll translation progress |
| GET | /api/result/:taskId | View translated PDF |
| GET | /api/result/:taskId/download | Download translated PDF |

### FastAPI (port 8000)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/ocr | OCR on image file |
| POST | /api/translate | Translate text |
| POST | /api/pdf-to-images | Convert PDF to page images |
| POST | /api/generate-pdf | Generate PDF from translated text |

## Notes

- First run loads EasyOCR + NLLB models from HuggingFace (~2GB download).
- CUDA GPU is recommended. Falls back to CPU if unavailable.
- MongoDB stores task state; uploads live on the filesystem.
- Supported languages: English, Hindi, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Bengali, Turkish, Vietnamese, Thai, Dutch, Polish, Romanian, Swedish, Czech, Greek, Hungarian, Indonesian, Malay, Ukrainian, Hebrew, Urdu, Tamil, Telugu.
