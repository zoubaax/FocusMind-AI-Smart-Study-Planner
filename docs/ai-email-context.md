# 📄 AI Email Assistant: Context & Requirements

## 🎯 Feature Overview
The **AI Email Assistant** is an agentic extension of the FocusMind AI Chat. It allows users to interact with their email accounts using natural language. The AI acts as a secretary that drafts, refines, and sends emails based on user prompts.

## 👥 User Story
> "As a student, I want to ask my AI assistant to draft an email to my professor or study group based on my current study progress, review the draft, and have the AI send it once I approve."

## 🔄 Core Workflow (The 2-Phase Flow)
1.  **Drafting Phase**: 
    *   User: "Send an email to prof@example.com about my math progress."
    *   AI: Analyzes the user's tasks/schedules.
    *   AI: Generates a Subject and Body.
    *   AI: Displays the draft to the user and asks: "Should I send this?"
2.  **Confirmation Phase**:
    *   User: "Yes, send it."
    *   AI: Triggers the backend SMTP service.
    *   AI: Confirms success: "Email sent successfully to prof@example.com."

## 🛠️ Technical Requirements
- **SMTP Integration**: Support for Gmail/Outlook/Mailtrap via `Spring Boot Starter Mail`.
- **Stateless Confirmation**: The AI must carry the "Draft" context from one message to the next or use structured JSON to signal intent.
- **Security**: Emails are only sent after explicit user confirmation.
- **Context Awareness**: The AI should be able to pull data from the user's `StudyTasks` or `Schedules` to populate the email body automatically.
