# AI-Powered Personalized Doubt Solving & Concept Gap Detector for Classrooms

A full-stack monorepo application designed to help classrooms capture student doubts in real-time and detect foundational concept gaps using AI.

---

## 🏗️ Repository Architecture

The project is structured into two completely separate, independent applications:

```text
├── backend/                       # Node.js + Express.js REST API
│   ├── node_modules/              # Isolated backend dependencies
│   ├── src/
│   │   ├── controllers/           # Request handlers & logic
│   │   ├── middlewares/           # Error handling & middleware
│   │   ├── routes/                # Express API routes
│   │   ├── app.js                 # Express app configuration
│   │   └── server.js              # Server entry point (Port 5001)
│   ├── .env.example               # Backend environment variables template
│   ├── .env                       # Local environment variables
│   ├── package-lock.json          # Independent backend lockfile
│   └── package.json               # Backend dependencies only
│
├── frontend/                      # Vite + React 19 + Tailwind CSS v4
│   ├── node_modules/              # Isolated frontend dependencies
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── assets/                # Images & SVGs
│   │   ├── App.jsx                # Main React component with Tailwind UI
│   │   ├── index.css              # Tailwind CSS entry
│   │   └── main.jsx               # React entry point
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration with proxy to backend
│   ├── package-lock.json          # Independent frontend lockfile
│   └── package.json               # Frontend dependencies only
│
├── .gitignore                     # Repository-level git ignore rules
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v8.0.0 or higher
- **MongoDB**: local MongoDB server or MongoDB Atlas database

---

### 1. Backend Setup & Run

Install and start MongoDB Community Server locally, or create a free MongoDB Atlas cluster. In PowerShell, navigate to the `backend` folder and copy the environment template:

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Set `MONGODB_URI` in `.env` to your local MongoDB address or Atlas connection string. Set `MONGODB_DB_NAME=knowra`. Set `GROQ_API_KEY` to enable AI doubt answers. Then install and start:

```powershell
npm install
npm run dev
```

- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

### AI doubt solving

The backend uses MongoDB for doubts, concepts, mastery evidence, and adaptive-practice sessions, an in-process LangGraph.js workflow, and a Groq provider adapter. The backend creates indexes and seeds the DSA concept graph and question bank on startup. Without a configured AI provider, doubt processing reports an explicit setup error rather than returning a mock answer.

See [backend/AI_ARCHITECTURE.md](./backend/AI_ARCHITECTURE.md) for AI workflow, prompt, and evaluation details, and [backend/LEARNING_ENGINE.md](./backend/LEARNING_ENGINE.md) for MongoDB, mastery, graph, and adaptive-practice setup. Run deterministic backend tests with `npm test` and the live labeled-model evaluation with `npm run evaluate:ai` from the backend directory.

---

### 2. Frontend Setup & Run

In a separate terminal, navigate to the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)

---

### 🛠️ Build for Production

#### Build Frontend:
```bash
cd frontend
npm run build
```

#### Run Backend in Production:
```bash
cd backend
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and root greeting |
| `GET` | `/api/health` | Healthcheck endpoint |
| `GET` | `/api/doubts` | List doubts and detected concept gaps |
| `POST` | `/api/doubts` | Submit a new doubt for AI analysis |
| `GET` | `/api/concepts/graph?studentId=maya-01` | View DSA concepts, prerequisites, and student mastery |
| `GET` | `/api/students/:studentId/mastery` | View per-concept mastery and assessment status |
| `POST` | `/api/practice/sessions` | Start an adaptive practice session |
| `POST` | `/api/practice/sessions/:sessionId/attempts` | Submit an answer and receive the next adaptive question |

### Sample POST Request Body:
```json
{
  "studentName": "Maya Patel",
  "subject": "Physics",
  "topic": "Optics",
  "doubt": "Why does light bend towards the normal in a denser medium?"
}
```

---

## 🎨 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/), [LangGraph.js](https://langchain-ai.github.io/langgraphjs/)
