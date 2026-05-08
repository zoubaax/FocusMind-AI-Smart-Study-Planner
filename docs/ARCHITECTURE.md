# 🏗️ FocusMind AI — Technical Architecture

This document provides a detailed breakdown of the system's architecture, data flow, and technical decisions.

---

## 🧩 System Overview

```
┌─────────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│   React SPA     │─────▶│  Spring Boot API      │─────▶│   PostgreSQL     │
│   (Vite + TW)   │ JWT  │  (Port 8080)          │ JPA  │   (Port 5432)    │
└─────────────────┘      └──────────┬───────────┘      └──────────────────┘
                                    │
                         ┌──────────┼───────────┐
                         │          │           │
                    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
                    │NVIDIA  │ │ Groq   │ │Cloudi- │
                    │NIM API │ │Whisper │ │nary    │
                    │(LLaMA) │ │  v3    │ │(Files) │
                    └────────┘ └────────┘ └────────┘
```

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register → Creates user, hashes password (BCrypt)
2. POST /api/auth/login    → Validates credentials, returns JWT
3. All subsequent requests  → JWT in Authorization header
4. JwtAuthFilter           → Intercepts every request, validates token
5. SecurityContext          → Injects authenticated User into @AuthenticationPrincipal
```

**Key Classes:**
- `JwtService` — Token generation & validation (HMAC-SHA256, 24h expiry)
- `JwtAuthFilter` — OncePerRequestFilter that reads the `Authorization` header
- `SecurityConfig` — Defines public vs. protected routes

---

## 🤖 AI Integration Architecture

### NVIDIA NIM (LLaMA Models)

All AI features use a **unified RestTemplate approach** to call the NVIDIA NIM `/v1/chat/completions` endpoint (OpenAI-compatible format).

```java
// Common pattern across all AI services:
HttpHeaders headers = new HttpHeaders();
headers.setBearerAuth(apiKey);
headers.setContentType(MediaType.APPLICATION_JSON);

Map<String, Object> body = Map.of(
    "model", "meta/llama-3.1-8b-instruct",
    "messages", messages,
    "temperature", 0.1,
    "max_tokens", 2048
);
```

**Models Used:**
| Model | Service | Purpose |
|---|---|---|
| `meta/llama-3.1-8b-instruct` | ChatService, FlashcardService, PlanService | Text analysis, generation |
| `meta/llama-3.2-11b-vision-instruct` | PlanService | Visual schedule reading |

### Groq Whisper v3

Voice transcription uses Groq's free-tier Whisper API:

```java
// TranscriptionService.java
MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
body.add("file", audioResource);
body.add("model", "whisper-large-v3");
body.add("response_format", "json");
// POST https://api.groq.com/openai/v1/audio/transcriptions
```

**Language Support:** Arabic, Moroccan Darija, French, English (auto-detected).

---

## 📦 Database Schema

### Entity Relationships

```
User (1) ────── (N) Schedule
User (1) ────── (N) StudyPlan
User (1) ────── (N) StudyTask
User (1) ────── (N) CourseMaterial (1) ────── (N) Flashcard
```

### Key Entities

| Entity | Table | Key Fields |
|---|---|---|
| `User` | `_user` | id, firstname, lastname, email, password |
| `Schedule` | `schedule` | id, fileName, fileUrl, extractedText, user |
| `StudyPlan` | `study_plan` | id, planContent (JSON), schedule, user |
| `StudyTask` | `study_task` | id, title, completed, dayOfWeek, user |
| `CourseMaterial` | `course_materials` | id, fileName, fileUrl, extractedText, user |
| `Flashcard` | `flashcards` | id, question, answer, courseMaterial |

### Serialization Safety

Circular references are prevented with `@JsonIgnore`:
- `CourseMaterial.user` → prevents User → CourseMaterial → User loop
- `CourseMaterial.extractedText` → prevents large text payloads in list responses
- `Flashcard.courseMaterial` → prevents Flashcard → Material → Flashcard loop

---

## 🎙️ Voice Agent Architecture

```
┌──────────────────────────────────────────────────┐
│                  Browser (React)                  │
│                                                    │
│  getUserMedia() → MediaRecorder (WebM/Opus)        │
│       │                                            │
│  AudioContext → AnalyserNode → Frequency Bars UI   │
│       │                                            │
│  ondataavailable (500ms chunks) → Blob             │
│       │                                            │
│  FormData.append('file', blob) → POST /api/ai/transcribe │
└──────────────────────────┬───────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────┐
│               Spring Boot Backend                 │
│                                                    │
│  TranscriptionController → TranscriptionService    │
│       │                                            │
│  RestTemplate → POST https://api.groq.com/...      │
│       │                                            │
│  Response: { "text": "..." } → Return to frontend  │
└──────────────────────────────────────────────────┘
```

### Frontend Hook: `useVoiceRecorder.js`
- **MediaRecorder API**: Captures audio in 500ms chunks
- **Web Audio API**: Real-time frequency analysis for visualizer bars
- **Audio Constraints**: `echoCancellation`, `noiseSuppression`, `autoGainControl`

---

## 🃏 Flashcard System Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ PDFUploadZone│───▶│ FlashcardCtrl│───▶│ Cloudinary  │
│  (React)     │    │  /upload     │    │  (Storage)  │
└─────────────┘    └──────┬───────┘    └─────────────┘
                          │
                   ┌──────▼───────┐
                   │FlashcardSvc  │
                   │ /generate    │
                   │              │
                   │ PDFBox →     │
                   │ Extract Text │
                   │              │
                   │ NVIDIA NIM → │
                   │ Generate Q&A │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │  PostgreSQL  │
                   │  flashcards  │
                   │  table       │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │ StudySession │
                   │ 3D FlipCards │
                   │ Progress %   │
                   └──────────────┘
```

### AI Prompt Strategy
The flashcard generation prompt enforces strict JSON output:
```
"Generate exactly 10 flashcards as a JSON array.
Each object must have 'question' and 'answer' keys.
Output ONLY valid JSON, no other text."
```

---

## 📧 Email Agent Architecture

Uses an **"Agentic Action Tag"** pattern:

```
User: "Send email to prof@example.com about my progress"
  ↓
AI generates response containing:
  [[SEND_EMAIL:{"to":"prof@example.com","subject":"...","body":"..."}]]
  ↓
ChatController intercepts the tag:
  1. Extracts JSON payload
  2. Calls EmailService.sendSimpleEmail()
  3. Strips tag from response
  4. Appends "✅ Email sent successfully"
  ↓
User sees clean confirmation (never sees the raw tag)
```

---

## 🔧 Configuration Reference

### `application.yml` Key Properties

| Property | Purpose |
|---|---|
| `spring.datasource.*` | PostgreSQL connection |
| `spring.jpa.hibernate.ddl-auto` | Schema auto-generation (`update`) |
| `application.security.jwt.*` | JWT secret key & expiration |
| `spring.ai.nvidia.*` | NVIDIA NIM API configuration |
| `spring.ai.groq.api-key` | Groq Whisper API key |
| `application.cloudinary.*` | File upload cloud storage |
| `spring.mail.*` | SMTP email configuration |

### Environment Variables (`.env`)

| Variable | Required | Provider |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL |
| `JWT_SECRET_KEY` | Yes | Self-generated |
| `CLOUDINARY_*` | Yes | cloudinary.com |
| `NVIDIA_API_KEY` | Yes | build.nvidia.com |
| `GROQ_API_KEY` | Yes | console.groq.com |
| `MAIL_*` | Yes | Gmail / Mailtrap |
