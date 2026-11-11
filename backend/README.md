# Backend

Express and MongoDB API for the AI-Powered Personalized Doubt Solving & Concept Gap Detector.

## Requirements

- Node.js 20.19 or later (Node.js 22 LTS recommended)
- npm
- MongoDB (local or Atlas)

## Setup

Run these commands in PowerShell from the `backend` folder:

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set `MONGODB_URI` to a reachable MongoDB connection string and replace `JWT_SECRET` with a long, random secret. For MongoDB Atlas, find the connection string under your cluster's **Connect → Drivers** page and replace its placeholders. It typically looks like:

```text
mongodb+srv://<db_username>:<db_password>@<cluster-host>/knowra?retryWrites=true&w=majority
```

Save and close Notepad, then start the API:

```powershell
npm run dev
```

Keep `.env` private and never commit it.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | HTTP port; defaults to `5001` |
| `NODE_ENV` | No | Runtime mode; defaults to `development` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `7d` |
| `CLIENT_URL` | No | Allowed browser origin; defaults to `http://localhost:5173` |
| `AI_SERVICE_URL` | No | Member 4 service base URL; blank enables mock AI |
| `AI_SERVICE_KEY` | No | Optional key sent to the configured AI service |

With `AI_SERVICE_URL` blank, doubt analysis returns a mock response and makes no external AI request. To connect Member 4's service, set `AI_SERVICE_URL` to its base URL (the backend appends `/analyze`) and optionally set `AI_SERVICE_KEY`. Only the doubt's subject, topic, and text are sent.

Public registration accepts `role: teacher`. For a public deployment, restrict teacher registration to invitations or administrative provisioning.

## Scripts and URLs

Run scripts from this folder:

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API with Node watch mode |
| `npm start` | Start the API |
| `npm test` | Run Jest/Supertest tests with an isolated MongoDB Memory Server |

The first test run may download a MongoDB test binary. Tests do not connect to `MONGODB_URI` or Atlas.

- API base: `http://localhost:5001/api`
- Health check: `http://localhost:5001/api/health`
- Swagger UI: `http://localhost:5001/api-docs`

## Endpoints

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/register` | Public; student by default, or teacher with `role: "teacher"` |
| `POST` | `/api/auth/login` | Public; returns a bearer token |
| `GET` | `/api/auth/me` | Authenticated user |
| `POST` | `/api/classrooms` | Teacher |
| `POST` | `/api/classrooms/join` | Student |
| `GET` | `/api/classrooms` | Authenticated user |
| `GET` | `/api/classrooms/:id` | Owning teacher or joined student |
| `GET` | `/api/classrooms/:id/gaps` | Teacher of the classroom |
| `POST` | `/api/doubts` | Student who joined the classroom |
| `GET` | `/api/doubts` | Own doubts (student) or classroom doubts (teacher) |
| `GET` | `/api/doubts/:id` | Doubt owner or classroom teacher |
| `POST` | `/api/doubts/:id/retry` | Owner of a failed doubt |
| `GET` | `/api/students/:id/gaps` | Student themselves or a teacher of one of their classrooms |

Protected endpoints require `Authorization: Bearer <token>`. Doubt listing supports `page`, `limit` (maximum 50), `status`, and `classroomId`.

## Full-flow smoke test (PowerShell)

Start the backend, ensure MongoDB is reachable, then run this in another PowerShell window. It registers a teacher and student, logs both in, creates and joins a classroom, submits a doubt, and retrieves the classroom's concept gaps:

```powershell
$baseUrl = 'http://localhost:5001/api'
$suffix = [guid]::NewGuid().ToString('N')

Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
  -ContentType 'application/json' `
  -Body (@{
    name = 'Test Teacher'
    email = "teacher-$suffix@example.com"
    password = 'securePass123'
    role = 'teacher'
  } | ConvertTo-Json) | Out-Null
$teacherLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
  -ContentType 'application/json' `
  -Body (@{ email = "teacher-$suffix@example.com"; password = 'securePass123' } | ConvertTo-Json)
$teacherToken = $teacherLogin.data.token

Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" `
  -ContentType 'application/json' `
  -Body (@{
    name = 'Test Student'
    email = "student-$suffix@example.com"
    password = 'securePass123'
  } | ConvertTo-Json) | Out-Null
$studentLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" `
  -ContentType 'application/json' `
  -Body (@{ email = "student-$suffix@example.com"; password = 'securePass123' } | ConvertTo-Json)
$studentToken = $studentLogin.data.token

$classroom = Invoke-RestMethod -Method Post -Uri "$baseUrl/classrooms" `
  -Headers @{ Authorization = "Bearer $teacherToken" } `
  -ContentType 'application/json' `
  -Body (@{ name = 'Biology 101'; subject = 'Biology' } | ConvertTo-Json)

$joinedClassroom = Invoke-RestMethod -Method Post -Uri "$baseUrl/classrooms/join" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -ContentType 'application/json' `
  -Body (@{ joinCode = $classroom.data.joinCode } | ConvertTo-Json)

$doubt = Invoke-RestMethod -Method Post -Uri "$baseUrl/doubts" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -ContentType 'application/json' `
  -Body (@{
    classroomId = $joinedClassroom.data._id
    subject = 'Biology'
    topic = 'Cell structure'
    text = 'What is the difference between a cell wall and a cell membrane?'
  } | ConvertTo-Json)

$gaps = Invoke-RestMethod -Method Get `
  -Uri "$baseUrl/classrooms/$($classroom.data._id)/gaps" `
  -Headers @{ Authorization = "Bearer $teacherToken" }

$doubt.data
$gaps.data | ConvertTo-Json -Depth 8
```

This flow uses mock AI unless `AI_SERVICE_URL` is configured.
