# 🧠 FocusMind AI — Smart Study Planner

An AI-powered full-stack study planner that analyzes your school schedule (PDF or image), generates personalized study plans, creates smart flashcards from course PDFs, and supports **voice commands in Arabic/Darija**. Powered by **NVIDIA Llama AI**, **Groq Whisper**, **Spring Boot**, and **React**.

---

## 📸 Features

- **📤 Schedule Upload** — Upload your school timetable as a **PDF** or **Image** (JPG, PNG). Files are stored securely on Cloudinary.
- **🤖 AI Study Plan Generation** — The AI reads your schedule, identifies free time slots, and creates a structured study plan tailored to your personal goals.
  - **PDF** schedules: Text is extracted with PDFBox and sent to **Llama 3.1 8B** for plan generation.
  - **Image** schedules: The image is sent to **Llama 3.2 11B Vision** which visually reads the timetable and generates a plan in one call.
- **✅ Task Management** — Activate a generated plan to turn it into a daily task list with progress tracking.
- **💬 AI Chat Agent** — Context-aware AI assistant that knows your schedules, tasks, and study progress. Powered by conversational memory.
- **📧 AI Email Assistant** — Ask the AI to draft and send real emails on your behalf. Uses a 2-phase "Draft → Confirm → Send" protocol.
- **🃏 AI Flashcard Generator** — Upload course PDFs, and the AI automatically generates Q&A flashcards. Study them in an immersive 3D flip-card interface with progress tracking.
- **🎙️ AI Voice Commands** — Speak to the AI in **Arabic, Darija, French, or English**. Voice is transcribed in real-time using **Groq Whisper v3** with a live audio visualizer.
- **📊 Dashboard Analytics** — Overview of your schedules, active plans, and task completion stats.
- **🔐 JWT Authentication** — Secure user registration and login with stateless JWT tokens.

---

## 🏗️ Architecture

```
FocusMind-AI-Smart-Study-Planner/
├── backend/          # Spring Boot REST API (Java 17)
│   ├── src/main/java/ma/zoubaa/smartstudyplanner/
│   │   ├── auth/          # Authentication (login, register)
│   │   ├── chat/          # AI Chat Agent, Voice Transcription
│   │   ├── exception/     # Global exception handling
│   │   ├── flashcard/     # AI Flashcard Generator (CRUD + AI)
│   │   ├── mail/          # Email service (SMTP integration)
│   │   ├── plan/          # AI study plan generation
│   │   ├── schedule/      # File upload & Cloudinary integration
│   │   ├── security/      # JWT, CORS, Spring Security config
│   │   ├── task/          # Study task management
│   │   └── user/          # User entity & repository
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/         # React SPA (Vite)
│   ├── src/
│   │   ├── api/            # Axios instance & interceptors
│   │   ├── components/
│   │   │   ├── auth/       # ProtectedRoute
│   │   │   ├── common/     # Reusable form elements
│   │   │   ├── dashboard/  # StatsGrid, TaskList, AIChat
│   │   │   ├── flashcard/  # FlipCard, StudySession, PDFUploadZone
│   │   │   ├── plan/       # PlanGenerator modal
│   │   │   └── schedule/   # FileUpload, ScheduleList
│   │   ├── context/        # AuthContext (JWT state management)
│   │   ├── hooks/          # useVoiceRecorder (audio capture)
│   │   ├── pages/          # Login, Register, Dashboard, Flashcards
│   │   └── services/       # API service layer
│   ├── index.html
│   └── package.json
│
└── docs/             # Project documentation
    ├── ARCHITECTURE.md
    └── WORKFLOW.md
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Programming language |
| **Spring Boot** | 3.4.0 | Application framework |
| **Spring Security** | — | Authentication & authorization |
| **Spring Data JPA** | — | Database ORM (Hibernate) |
| **Spring Boot Starter Mail** | — | SMTP email sending (Gmail, Mailtrap) |
| **Spring AI** | 1.0.0-M3 | AI model integration (OpenAI-compatible) |
| **PostgreSQL** | — | Relational database |
| **JJWT** | 0.11.5 | JWT token generation & validation |
| **PDFBox** | 3.0.1 | PDF text extraction |
| **Cloudinary** | 1.36.0 | Cloud file storage (images & PDFs) |
| **dotenv-java** | 3.0.0 | Environment variable management |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI component library |
| **Vite** | 8 | Build tool & dev server |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **HeroUI** | 3 | Pre-built UI component library |
| **Framer Motion** | 12 | Animation library |
| **React Router DOM** | 7 | Client-side routing |
| **Axios** | 1.16 | HTTP client for API calls |
| **Lucide React** | 1.14 | Icon library |
| **React Hot Toast** | 2.6 | Toast notification system |
| **React Markdown** | — | Renders AI responses with rich formatting |

### AI Models & Services

| Model / Service | Provider | Use Case |
|---|---|---|
| **Meta Llama 3.1 8B Instruct** | NVIDIA NIM | PDF analysis, study plans, AI Chat, flashcard generation |
| **Meta Llama 3.2 11B Vision** | NVIDIA NIM | Image schedule reading → visual plan generation |
| **Whisper Large v3** | Groq | Voice-to-text transcription (Arabic, Darija, French, English) |

---

## ⚙️ Prerequisites

- **Java 17** (JDK)
- **Node.js 18+** and **npm**
- **PostgreSQL** (running locally or remotely)
- **Cloudinary account** (free tier works) — [cloudinary.com](https://cloudinary.com)
- **NVIDIA NIM API Key** — [build.nvidia.com](https://build.nvidia.com)
- **Groq API Key** (free) — [console.groq.com](https://console.groq.com)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zoubaax/FocusMind-AI-Smart-Study-Planner.git
cd FocusMind-AI-Smart-Study-Planner
```

### 2. Setup the Backend

```bash
cd backend
```

**Create a `.env` file** from the example:

```bash
cp .env.example .env
```

**Edit `.env`** with your credentials:

```env
# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/focusmind
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# Security Configuration
JWT_SECRET_KEY=your_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NVIDIA AI Configuration
NVIDIA_API_KEY=nvapi-your_key_here

# Groq Configuration (Voice Transcription)
GROQ_API_KEY=gsk_your_key_here

# Mail Configuration (Gmail or Mailtrap)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

> **Gmail users:** You must generate a [Google App Password](https://myaccount.google.com/apppasswords) (requires 2-Step Verification). Do **not** use your regular password.
>
> **For safe testing:** Use [Mailtrap.io](https://mailtrap.io) with `MAIL_HOST=sandbox.smtp.mailtrap.io` and `MAIL_PORT=2525`.

**Create the PostgreSQL database:**

```sql
CREATE DATABASE focusmind;
```

**Run the backend:**

```bash
./mvnw spring-boot:run
```

The API will start on `http://localhost:8080`.

> **Note:** Hibernate will automatically create all tables on first run (`ddl-auto: update`).

### 3. Setup the Frontend

```bash
cd frontend
```

**Install dependencies:**

```bash
npm install
```

**Create a `.env` file** from the example:

```bash
cp .env.example .env
```

The default values should work for local development:

```env
VITE_PROXY_PATH=/api
VITE_PROXY_TARGET=http://localhost:8080
VITE_API_URL=/api
```

**Start the dev server:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |

### Schedules
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schedules` | Get all schedules for the logged-in user |
| `POST` | `/api/schedules/upload` | Upload a schedule file (PDF/Image) |
| `DELETE` | `/api/schedules/{id}` | Delete a schedule |

### Study Plans
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/plans` | Get all plans for the logged-in user |
| `POST` | `/api/plans/generate` | Generate AI study plan from a schedule |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks for the logged-in user |
| `POST` | `/api/tasks/activate/{planId}` | Convert a study plan into daily tasks |
| `PATCH` | `/api/tasks/{id}/toggle` | Toggle a task's completion status |

### AI Chat & Voice
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message to the AI agent (supports conversation history) |
| `POST` | `/api/ai/transcribe` | Transcribe audio file to text via Groq Whisper v3 |

### Flashcards
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/flashcards/materials` | Get all uploaded course materials |
| `POST` | `/api/flashcards/upload` | Upload a course PDF for flashcard generation |
| `POST` | `/api/flashcards/generate/{materialId}` | Generate AI flashcards from a material |
| `GET` | `/api/flashcards/{materialId}` | Get all flashcards for a material |
| `DELETE` | `/api/flashcards/materials/{id}` | Delete a course material and its flashcards |

### User
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/me` | Get current user profile |

---

## 🐳 Docker

A Dockerfile is provided for the backend:

```bash
cd backend
docker build -t focusmind-backend .
docker run -p 8080:8080 --env-file .env focusmind-backend
```

---

## 🔐 Security

- All API endpoints (except `/api/auth/**`) require a valid JWT token in the `Authorization` header.
- Passwords are hashed with **BCrypt** before storage.
- CORS is configured to accept requests from all origins during development.
- JWT tokens expire after **24 hours**.

---

## 📖 How It Works

### PDF Flow
```
Upload PDF → Cloudinary stores file → PDFBox extracts text at upload time
         → Text saved to database → User clicks "Generate Plan"
         → Extracted text + goals sent to Llama 3.1 8B → JSON study plan returned
```

### Image Flow
```
Upload Image → Cloudinary stores file → User clicks "Generate Plan"
            → Image downloaded → base64 encoded → sent to Llama 3.2 Vision
            → AI reads the schedule visually → JSON study plan returned
```

### AI Chat Agent (Context-Aware)
```
User sends message → Frontend sends message + conversation history
→ ChatController receives request → ChatService builds context:
   • Fetches user's schedules from ScheduleRepository
   • Fetches user's pending tasks from StudyTaskRepository
   • Injects context into the system prompt
   • Appends last 10 messages of conversation history
→ Full prompt sent to Llama 3.1 8B via NVIDIA NIM API
→ AI responds with context-aware answer
```

**Key Technical Details:**
- The AI receives a **system prompt** containing the user's real data (schedules, tasks) on every request.
- **Conversation history** (last 10 messages) is sent alongside each new message, giving the AI "memory" within a session.
- The temperature is set to **0.1** for precise, instruction-following behavior.
- Uses **RestTemplate** for direct HTTP calls to the NVIDIA NIM `/v1/chat/completions` endpoint (OpenAI-compatible format).

### AI Email Assistant (Agentic Action)
```
User: "Draft an email to prof@example.com about my progress"
→ AI generates a formatted email draft (Subject + Body)
→ AI asks: "Should I send this email?"

User: "Yes, send it."
→ AI outputs a hidden action tag: [[SEND_EMAIL:{"to":"...","subject":"...","body":"..."}]]
→ ChatController intercepts the tag before it reaches the frontend
→ Tag is parsed → EmailService.sendSimpleEmail() is called via SMTP
→ Tag is stripped from the response → User sees "✅ Email sent successfully"
```

**Key Technical Details:**
- Uses a **structured action tag** (`[[SEND_EMAIL:...]]`) embedded in the AI's response to trigger backend side-effects.
- The `ChatController` acts as an **interceptor**: it scans every AI response for the tag, extracts the JSON payload, calls the `EmailService`, and **strips the tag** so the user never sees it.
- Emails are sent via `Spring Boot Starter Mail` using `JavaMailSender` with SMTP (Gmail or Mailtrap).
- The system uses a **"Central Assistant" model**: one SMTP account sends on behalf of all users. The user's identity is included in the email body for context.

### AI Flashcard Generator
```
Upload Course PDF → Cloudinary stores file → PDFBox extracts text
→ User clicks "Generate Flashcards" → Extracted text sent to Llama 3.1 8B
→ AI returns JSON array of {question, answer} pairs
→ Flashcards saved to database → Immersive 3D study session with flip animations
```

**Key Technical Details:**
- AI prompt enforces strict **JSON-only output** for reliable parsing.
- 3D flip cards built with **Framer Motion** `rotateY` transforms and `backfaceVisibility`.
- Progress tracking shows percentage of cards studied per session.

### AI Voice Agent
```
User clicks Mic → Browser MediaRecorder captures audio (WebM/Opus)
→ Live audio visualizer shows frequency bars in real-time
→ User clicks Mic again → Audio blob sent to POST /api/ai/transcribe
→ Backend forwards to Groq Whisper v3 API → Transcribed text returned
→ Text injected into chat input → User can send to AI agent
```

**Key Technical Details:**
- Uses **Groq Whisper v3** (free tier) for high-quality multilingual transcription.
- Supports **Moroccan Darija**, Arabic, French, and English.
- Real-time **Audio Analyzer** (Web Audio API) provides visual feedback via frequency bars.
- Recording captured with **MediaRecorder API** using `audio/webm;codecs=opus`.

---

## 📁 Key Libraries Explained

| Library | Why it's used |
|---|---|
| **Spring Boot Starter Web** | Provides REST controller support, embedded Tomcat server, JSON serialization |
| **Spring Boot Starter Data JPA** | ORM layer using Hibernate to interact with PostgreSQL without writing SQL |
| **Spring Boot Starter Security** | Enables authentication, authorization, and security filter chains |
| **Spring Boot Starter Validation** | Bean validation for request DTOs (`@NotBlank`, `@Email`, etc.) |
| **Spring Boot Starter Mail** | Sends emails via SMTP (Gmail, Mailtrap). Used by the AI Email Assistant |
| **Spring AI (OpenAI Starter)** | Provides `ChatClient` abstraction for AI model communication |
| **JJWT (Java JWT)** | Generates and validates JWT tokens for stateless authentication |
| **PDFBox** | Extracts text content from uploaded PDF files for AI analysis |
| **Cloudinary SDK** | Uploads, stores, and manages files (images/PDFs) in the cloud |
| **dotenv-java** | Loads environment variables from `.env` files during development |
| **Axios** | Promise-based HTTP client with request/response interceptors for JWT injection |
| **React Router DOM** | Declarative client-side routing with protected route support |
| **React Markdown** | Renders AI chat responses with rich Markdown formatting (bold, lists, blockquotes) |
| **Framer Motion** | Smooth page transitions, modal animations, and micro-interactions |
| **Tailwind CSS** | Utility-first CSS for rapid, consistent UI styling |
| **Lucide React** | Clean, minimal SVG icon set used throughout the UI |
| **React Hot Toast** | Elegant toast notifications for success/error feedback |

---

## 👤 Author

**Zoubaa** — [@zoubaax](https://github.com/zoubaax)

---

## 📄 License

This project is for educational purposes.
