#  DevAudit AI

> **AI-Powered Code Review Platform** — An agentic AI system that reviews GitHub Pull Requests using Google Gemini, catching bugs, security issues, and code smells before they hit production.

![DevAudit AI](https://img.shields.io/badge/DevAudit-AI-238636?style=for-the-badge&logo=github&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.0-Flash-4285F4?style=flat-square&logo=google&logoColor=white)

---

## ✨ Features

- 🤖 **Multi-Step AI Agent Pipeline** — Parse → Analyze → Security Scan → Synthesize (not a single-prompt hack)
- 🔒 **Deep Security Scanning** — SQL injection, XSS, hardcoded secrets, auth bypasses
- 📊 **Quality Score (0-100)** — Color-coded animated score gauge with reasoning
- 🔴 **Real-Time Streaming** — Watch the AI agent work step-by-step via Socket.IO
- 📝 **Issue-Level Feedback** — Per-file, per-line issues with severity badges and fix suggestions
- 🧪 **Suggested Tests** — AI-generated test cases for changed code
- 💬 **Post to GitHub** — One-click to post the full review as a GitHub PR comment
- 🌙 **Beautiful Dark UI** — GitHub-inspired dark theme with animations
- 🔐 **GitHub OAuth** — Secure authentication with encrypted token storage

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS v3 |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Real-Time** | Socket.IO Client |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + GitHub OAuth |
| **AI Engine** | Google Gemini 2.0 Flash (free tier) |
| **Job Queue** | Bull + Redis (optional) |
| **Security** | Helmet, CORS, AES-256-CBC encryption |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **GitHub OAuth App** (see below)
- **Google Gemini API Key** (see below)
- **Redis** (optional, for job queue)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/devaudit-ai.git
cd devaudit-ai

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
```

### 3. Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** DevAudit AI
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
4. Copy **Client ID** and **Client Secret** to your `.env` file

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Create API Key**
3. Copy the key to your `.env` file as `GEMINI_API_KEY`

### 5. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 --name devaudit-mongo mongo:7
```

### 6. Run the App

```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## 📁 Project Structure

```
devaudit-ai/
├── client/                    # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── repositories/  # Repo list
│   │   │   ├── reviews/       # Review history
│   │   │   ├── review/[id]/   # Review detail (core feature)
│   │   │   └── auth/callback/ # OAuth callback
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom hooks (useSocket, useReview)
│   │   ├── store/             # Zustand state management
│   │   ├── api/               # Axios instance
│   │   └── types/             # TypeScript interfaces
│   └── tailwind.config.ts     # Custom theme
├── server/                    # Express.js Backend
│   └── src/
│       ├── routes/            # API route definitions
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic
│       │   ├── agentService.js    # Multi-step AI pipeline
│       │   ├── geminiService.js   # Gemini API wrapper
│       │   └── githubService.js   # GitHub API wrapper
│       ├── models/            # Mongoose schemas
│       ├── middleware/         # Auth, error handling
│       └── queues/            # Bull job queue (optional)
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker setup
└── README.md
```

---

## 📡 API Documentation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/github` | Start GitHub OAuth flow | ❌ |
| GET | `/api/auth/github/callback` | OAuth callback | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/repos` | List user's GitHub repos | ✅ |
| GET | `/api/repos/:fullName/prs` | List open PRs for a repo | ✅ |
| POST | `/api/review/start` | Start AI review `{ prUrl }` | ✅ |
| GET | `/api/review/history` | Paginated review history | ✅ |
| GET | `/api/review/stats` | Dashboard statistics | ✅ |
| GET | `/api/review/:id` | Get review by ID | ✅ |
| POST | `/api/review/:id/post-comment` | Post review to GitHub PR | ✅ |
| DELETE | `/api/review/:id` | Delete a review | ✅ |

---

## 🔌 Socket.IO Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `join-review` | `{ reviewId }` |
| Server → Client | `agent-step` | `{ step, message, status }` |
| Server → Client | `review-file` | `{ filename, issues }` |
| Server → Client | `review-done` | `{ reviewId, score, summary }` |
| Server → Client | `review-error` | `{ message }` |

---

## 🤖 AI Agent Pipeline

The review process uses a **multi-step agentic pipeline** (not a single prompt):

```
Step 1: PARSE      → Parse raw git diff into structured file/chunk data
Step 2: ANALYZE    → Per-file code analysis (bugs, smells, errors)
Step 3: SECURITY   → Deep security vulnerability scan
Step 4: SYNTHESIS  → Generate summary, score, critical fixes, test suggestions
Step 5: COMPLETE   → Finalize and emit results
```

Each step emits real-time events via Socket.IO so the UI updates live.

---

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ and Gemini AI
</p>
