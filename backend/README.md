# Backend: Setup and testing

This folder contains the server for the classroom doubt-solving app. Follow the steps below in order. You do not need to start the frontend to test the backend.

## 1. What you need

- Windows PowerShell
- Node.js **20.19 or newer** (Node.js 22 LTS is recommended)
- npm (installed with Node.js)
- A MongoDB database: either a local MongoDB server or a MongoDB Atlas cluster

Check that Node.js and npm are installed:

```powershell
node --version
npm --version
```

## 2. Install the backend

Open PowerShell in the project folder (the folder that contains `backend`), then run:

```powershell
cd backend
npm install
```

## 3. Add your private settings

Create your own `.env` file from the example. If you already have a `.env`, this command keeps it:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

In Notepad, fill in these two required settings:

```text
MONGODB_URI=your MongoDB connection string
JWT_SECRET=your long random secret
```

For example, a MongoDB Atlas connection string looks like this. Replace every placeholder with the values from your Atlas cluster:

```text
MONGODB_URI=mongodb+srv://<database-user>:<database-password>@<cluster-host>/knowra?retryWrites=true&w=majority
```

To find your Atlas connection string, open your cluster in Atlas, choose **Connect**, then **Drivers**, and copy the connection string. Replace the username, password, and cluster placeholders. If the password contains special characters, URL-encode them before putting the password in the URI.

Create a long random value for `JWT_SECRET`. Do not use the example secret in a real deployment.

The other settings can usually stay as shown in `.env.example`:

| Setting | What it does |
|---|---|
| `PORT` | Server port; defaults to `5001` |
| `NODE_ENV` | Run mode; defaults to `development` |
| `JWT_EXPIRES_IN` | How long a login token lasts; defaults to `7d` |
| `CLIENT_URL` | Frontend address allowed to call the API; defaults to `http://localhost:5173` |
| `AI_SERVICE_URL` | Leave blank to use the built-in mock AI |
| `AI_SERVICE_KEY` | Optional key for the configured AI service |

Save the file and close Notepad. **Never send anyone your `.env` file or commit it to Git.**

## 4. Start the server

In the same PowerShell window, run:

```powershell
npm run dev
```

Keep this window open while using the API. The server needs to connect to MongoDB before it can start. If startup reports a MongoDB connection error, check that `MONGODB_URI` is copied correctly, starts with `mongodb://` or `mongodb+srv://`, and that your database is reachable. For Atlas, also check that your network IP is allowed in Atlas Network Access.

When the server is running, these addresses should work:

- Health check: <http://localhost:5001/api/health>
- API reference: <http://localhost:5001/api-docs>

The health check should return JSON with `"success": true`.

## 5. AI behavior

The backend does not call an AI provider directly.

- If `AI_SERVICE_URL` is blank, the backend returns a sample answer and sample concept gap. This mock mode lets you test without an AI service.
- When Member 4 provides the service, put its base URL in `AI_SERVICE_URL` and restart the backend. The backend sends requests to that URL plus `/analyze`.
- The request contains only the doubt's subject, topic, and text; it does not include the student's name, email, or ID.
- `AI_SERVICE_KEY` is optional and is only needed if Member 4's service requires it.

## 6. Available API endpoints

Open <http://localhost:5001/api-docs> for request and response details. The main endpoints are:

| Method | Address | Who can use it |
|---|---|---|
| `GET` | `/api/health` | Anyone |
| `POST` | `/api/auth/register` | Anyone; creates a student by default |
| `POST` | `/api/auth/login` | Anyone; returns a login token |
| `GET` | `/api/auth/me` | Logged-in user |
| `POST` | `/api/classrooms` | Teacher |
| `POST` | `/api/classrooms/join` | Student |
| `GET` | `/api/classrooms` | Logged-in user |
| `GET` | `/api/classrooms/:id` | Classroom's teacher or a student who joined it |
| `GET` | `/api/classrooms/:id/gaps` | Teacher of that classroom |
| `POST` | `/api/doubts` | Student who joined that classroom |
| `GET` | `/api/doubts` | Student's own doubts or teacher's classroom doubts |
| `GET` | `/api/doubts/:id` | Doubt owner or teacher of its classroom |
| `POST` | `/api/doubts/:id/retry` | Owner of a failed doubt |
| `GET` | `/api/students/:id/gaps` | That student or a teacher of one of their classrooms |

After login, copy the returned token into the `Authorization` header like this:

```text
Authorization: Bearer paste-your-token-here
```

Public registration currently allows `"role": "teacher"` so you can create a teacher account for testing. For a public production website, teacher accounts should be invitation-only or created by an administrator.

## 7. Try the complete classroom flow

First, start the backend in one PowerShell window and make sure the health check works. Then open a **second** PowerShell window in the project folder and paste the commands below. The script creates new accounts each time it runs.

```powershell
cd backend
$api = 'http://localhost:5001/api'
$unique = [guid]::NewGuid().ToString('N')
$password = 'securePass123'

# Create and log in as a teacher.
$null = Invoke-RestMethod -Method Post -Uri "$api/auth/register" `
  -ContentType 'application/json' `
  -Body (@{
    name = 'Test Teacher'
    email = "teacher-$unique@example.com"
    password = $password
    role = 'teacher'
  } | ConvertTo-Json)
$teacherLogin = Invoke-RestMethod -Method Post -Uri "$api/auth/login" `
  -ContentType 'application/json' `
  -Body (@{ email = "teacher-$unique@example.com"; password = $password } | ConvertTo-Json)
$teacherToken = $teacherLogin.data.token

# Create and log in as a student.
$null = Invoke-RestMethod -Method Post -Uri "$api/auth/register" `
  -ContentType 'application/json' `
  -Body (@{
    name = 'Test Student'
    email = "student-$unique@example.com"
    password = $password
  } | ConvertTo-Json)
$studentLogin = Invoke-RestMethod -Method Post -Uri "$api/auth/login" `
  -ContentType 'application/json' `
  -Body (@{ email = "student-$unique@example.com"; password = $password } | ConvertTo-Json)
$studentToken = $studentLogin.data.token

# Teacher creates a classroom; student joins using its join code.
$classroom = Invoke-RestMethod -Method Post -Uri "$api/classrooms" `
  -Headers @{ Authorization = "Bearer $teacherToken" } `
  -ContentType 'application/json' `
  -Body (@{ name = 'Biology 101'; subject = 'Biology' } | ConvertTo-Json)
$joined = Invoke-RestMethod -Method Post -Uri "$api/classrooms/join" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -ContentType 'application/json' `
  -Body (@{ joinCode = $classroom.data.joinCode } | ConvertTo-Json)

# Student submits a doubt; mock AI answers it unless AI_SERVICE_URL is configured.
$doubt = Invoke-RestMethod -Method Post -Uri "$api/doubts" `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -ContentType 'application/json' `
  -Body (@{
    classroomId = $joined.data._id
    subject = 'Biology'
    topic = 'Cell structure'
    text = 'What is the difference between a cell wall and a cell membrane?'
  } | ConvertTo-Json)

# Teacher checks the concept gaps found for the classroom.
$gaps = Invoke-RestMethod -Method Get `
  -Uri "$api/classrooms/$($classroom.data._id)/gaps" `
  -Headers @{ Authorization = "Bearer $teacherToken" }

$doubt.data
$gaps.data | ConvertTo-Json -Depth 8
```

If the commands succeed, the doubt response should have status `answered`, and the final output shows the classroom's concept gaps.

## 8. Run the tests

Open a PowerShell window in the `backend` folder and run:

```powershell
npm test
```

The tests use a temporary MongoDB server and do **not** connect to the database in `.env` or to Atlas. The first run may download a MongoDB test program.
