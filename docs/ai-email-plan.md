# 🗺️ AI Email Assistant: Implementation Plan

## Phase 1: Backend Plumbing (The Infrastructure)
- [x] **Dependency**: Add `spring-boot-starter-mail` to `pom.xml`.
- [x] **Configuration**: Add SMTP properties to `application.yml` (Host, Port, Username, Password).
- [x] **Security**: Configure environment variables for sensitive email credentials.
- [x] **Service Layer**: Create `EmailService.java` with a `sendSimpleEmail(to, subject, body)` method.

## Phase 2: AI Intent Detection (The Brain)
- [x] **Prompt Update**: Enhance the `ChatService` system prompt to recognize "Email" intents.
- [x] **Instructional Logic**: Teach the AI to distinguish between "Drafting" (Phase 1) and "Confirming" (Phase 2).
- [x] **Structured Output**: Define a JSON structure for the AI to return when it wants to trigger an email action (e.g., `ACTION:SEND_EMAIL`).

## Phase 3: Multi-turn Interaction (The Logic)
- [x] **State Handling**: Implement a way to pass the draft back and forth (or use a "Hidden Field" approach).
- [x] **Controller Update**: Update `ChatController` to handle the transition from "Draft" to "Sent".

## Phase 4: UI/UX Enhancements (The Interface)
- [x] **Draft Display**: Format the AI's "Draft" output in the chat bubble so it's clearly readable.
- [x] **Success Toasts**: Add a frontend notification when the email is actually dispatched.

## Phase 5: Verification & Testing
- [ ] **Dry Run**: Test with [Mailtrap](https://mailtrap.io) to ensure emails are formatted correctly.
- [ ] **Real Test**: Send a test email to a real address.
- [ ] **Edge Cases**: Handle invalid email addresses or SMTP connection failures gracefully.
