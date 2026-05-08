# 📖 FocusMind AI — User Workflow Guide

This document explains how to use every feature of FocusMind AI, step by step.

---

## 🔐 1. Getting Started

### Register & Login
1. Open `http://localhost:5173` in your browser.
2. Click **"Register"** and create your account (First Name, Last Name, Email, Password).
3. After registration, **log in** with your email and password.
4. You'll be redirected to the **Dashboard**.

---

## 📤 2. Upload Your Schedule

### Supported Formats
- **PDF** — The AI extracts text directly from the document.
- **Image (JPG, PNG)** — The AI "reads" the timetable visually using computer vision.

### Steps
1. Go to **"My Schedules"** in the sidebar.
2. Click **"Upload Schedule"**.
3. Drag & drop your file or click to browse.
4. Your file is uploaded to **Cloudinary** and stored securely.
5. For PDFs, text is automatically extracted and saved for later use.

---

## 🤖 3. Generate an AI Study Plan

### How It Works
The AI analyzes your schedule, finds your free time slots, and creates a personalized weekly study plan.

### Steps
1. Go to **"My Plans"** in the sidebar.
2. Click **"Generate Plan"** on any uploaded schedule.
3. (Optional) Add your **study goals** (e.g., "Focus on Math and Physics").
4. Wait 10-30 seconds while the AI generates your plan.
5. The plan appears as a structured weekly timetable.

### PDF vs. Image
| Upload Type | AI Model Used | How It Works |
|---|---|---|
| **PDF** | Llama 3.1 8B | Text extracted by PDFBox → sent to AI as plain text |
| **Image** | Llama 3.2 11B Vision | Image encoded as base64 → AI reads it visually |

---

## ✅ 4. Manage Your Tasks

### Activate a Plan
1. After generating a plan, click **"Activate Plan"**.
2. The AI plan is converted into a **daily task checklist**.
3. Tasks appear on your **Dashboard** under "Today's Tasks".

### Track Progress
- Click the checkbox next to each task to mark it as completed.
- Your **completion percentage** updates in real-time on the dashboard.

---

## 💬 5. Chat with the AI Assistant

### What It Can Do
- Answer study questions
- Explain difficult concepts
- Create custom study plans
- Draft and send emails on your behalf
- Provide study tips and techniques

### How to Use
1. Go to **"AI Assistant"** in the sidebar.
2. Type your message in the chat input box.
3. The AI responds with context-aware answers (it knows your schedules and tasks!).

### Quick Suggestions
Click any of the suggestion chips (e.g., "Create study plan", "Explain concept") to pre-fill the input.

---

## 📧 6. Send Emails via AI

### The 2-Phase Protocol
FocusMind uses a safe "Draft → Confirm → Send" workflow:

#### Phase 1: Draft
```
You: "Draft an email to prof@example.com about my exam preparation"
AI:  "Here's a draft email:
      Subject: Exam Preparation Update
      Body: Dear Professor, ...
      
      Would you like me to send this email?"
```

#### Phase 2: Confirm & Send
```
You: "Yes, send it."
AI:  "✅ Email sent successfully to prof@example.com"
```

### Important Notes
- The AI uses the platform's configured SMTP account to send emails.
- Your name is included in the email body for identification.
- You can ask the AI to modify the draft before sending.

---

## 🃏 7. AI Flashcard Generator (Study Vault)

### What It Does
Upload any course PDF, and the AI automatically generates Q&A flashcards that you can study in an immersive 3D interface.

### Steps
1. Go to **"Study Vault"** in the sidebar.
2. **Upload a course PDF** by dragging it into the upload zone.
3. Wait for the file to upload to Cloudinary.
4. Click **"Generate Flashcards"** on the uploaded material.
5. Wait 15-60 seconds while the AI reads your PDF and creates flashcards.
6. Click **"Study"** to enter the immersive study session.

### Study Session Features
- **3D Flip Cards** — Click any card to flip between Question and Answer.
- **Navigation** — Use the arrow buttons or keyboard arrows to move between cards.
- **Progress Tracking** — See your completion percentage (e.g., "70% covered").
- **Audio Feedback** — Hear a satisfying flip sound when you turn a card.
- **Mobile Responsive** — Cards resize automatically for phone screens.

---

## 🎙️ 8. AI Voice Commands

### What It Does
Speak to the AI in your preferred language instead of typing. The voice is transcribed using Groq Whisper v3 and injected into the chat.

### Supported Languages
- 🇲🇦 **Moroccan Darija** (e.g., "Chno khsni nqra lyoum?")
- 🇸🇦 **Arabic** (e.g., "كيف يمكنني تنظيم وقتي للدراسة؟")
- 🇫🇷 **French** (e.g., "Crée-moi un plan d'étude")
- 🇬🇧 **English** (e.g., "What should I study today?")

### Steps
1. Open the **AI Assistant** chat.
2. Click the **Mic icon** 🎙️ next to the input box.
3. **Allow microphone access** when your browser asks.
4. **Speak your command** clearly.
5. Watch the **live visualizer bars** — they should move with your voice.
6. Watch the **timer** count up (0:01, 0:02...).
7. Click the **Mic icon again** to stop recording.
8. Wait for the **"Voice transcribed!"** toast notification.
9. Your words appear in the input box as text.
10. Click **Send** (or press Enter) to submit to the AI.

### Troubleshooting
| Issue | Solution |
|---|---|
| Bars stay flat / no sound | Check Windows Sound Settings → Input Device |
| "Microphone access denied" | Click the 🔒 lock icon in Chrome → Allow Microphone |
| Transcription says wrong words | Speak louder and closer to the mic |
| Recording too short error | Hold the mic button longer (at least 2 seconds) |

---

## 📊 9. Dashboard Overview

Your dashboard gives you a bird's-eye view of everything:

| Section | What It Shows |
|---|---|
| **Welcome Banner** | Greeting with your name |
| **Stats Grid** | Total schedules, active plans, pending tasks |
| **Today's Tasks** | Checklist of today's study tasks |
| **AI Assistant** | Quick access to the chat |
| **Study Vault** | Quick access to flashcards |

---

## 🔑 Quick Reference

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `Enter` | Send chat message |
| `Shift + Enter` | New line in chat |
| `←` `→` | Navigate flashcards in study session |

### API Base URLs
| Environment | Frontend | Backend |
|---|---|---|
| **Development** | `http://localhost:5173` | `http://localhost:8080` |
| **Production** | Your Vercel URL | Your deployed API URL |
