# Exam Participant Flow

This document describes the flow for users participating in online exams, including registration, starting, answering, submitting, and viewing results.

## Entry Points

1. **Participation Link** – `/exams/participate/[id]`  
   Public link shared by exam creator. Users can register via login or public registration (phone + optional name/national_id).

2. **Available Exams** – `/exams/available`  
   List of exams the logged-in user is registered for. User can start or continue an exam from here.

## Flow Overview

```
Entry (Link or Available) → Participate Page → Register (if needed) → Take Page → Start Exam → Answer Questions → Submit → Result Page
```

## Registration

### Authenticated Registration

- User is logged in.
- Calls `POST /api/exams/{id}/register`.
- Backend creates `ExamParticipant` with `status: 'registered'`.
- Redirects to `/exams/take/[id]`.

### Public Registration (via link)

- User is not logged in.
- Fills form: phone_number (required), name (optional), national_id (optional).
- Calls `POST /api/exams/{id}/register-public`.
- Backend finds or creates user, creates participant, returns token.
- Frontend calls `setToken(token)` so subsequent requests are authenticated.
- Redirects to `/exams/take/[id]`.

## Take Exam Page

### Prerequisites

- User must be registered for the exam.
- Exam must be published and active.
- If exam has time restrictions (`date`, `start_time`, `end_time` in meta), current time must be within the window.

### Start Exam

- When `status === 'registered'`, user sees "شروع آزمون" button.
- Clicking calls `POST /api/exams/{id}/start`.
- Backend updates participant to `status: 'started'`, sets `started_at`.
- Response includes: `questions`, `answers` (saved), `remaining_seconds` (based on `duration_minutes` and `started_at`).
- Frontend uses this response to render questions, load saved answers, and set the timer.

### Resuming (status === 'started')

- If user navigates away and returns, or refreshes, participant status is already `started`.
- Frontend calls `POST /api/exams/{id}/start` again (idempotent).
- Same response: questions, answers, `remaining_seconds`.
- Answers and timer are restored from the response.

### Answering

- Each answer change triggers `POST /api/exams/{id}/save-answer` with `exam_question_id` and `answer`.
- Answers are stored in `exam_participants.answers` (JSON).

### Submit

- User clicks "ارسال آزمون".
- Calls `POST /api/exams/{id}/submit`.
- Backend calculates score, sets `status: 'completed'`, `score`, `total_points`, `passed`, `completed_at`.
- User sees summary and can go to result page.

## Result Page

- Route: `/exams/[id]/result`.
- Calls `GET /api/exams/{id}/my-result`.
- Shows score, rank, pass/fail, and per-question review with correct/incorrect answers.

## Status Transitions

| Status      | Meaning                          | Allowed Actions                    |
| ----------- | -------------------------------- | ---------------------------------- |
| `registered`| User registered, exam not started | Start exam                         |
| `started`   | Exam in progress                 | Answer, save, submit               |
| `completed` | Exam finished                    | View result                        |

## Time Checks

- **Exam window**: `meta.date` + `meta.start_time` / `meta.end_time` (or legacy `meta.start_at` / `meta.end_at`).
- Before start: user cannot start exam; message shown.
- After end: user cannot save answers; submit may be blocked.
- **Duration**: `meta.duration_minutes` – timer counts down from `started_at`. Backend returns `remaining_seconds` in start response.

## API Endpoints Summary

| Method | Endpoint                         | Auth   | Description                    |
| ------ | -------------------------------- | ------ | ------------------------------ |
| GET    | `/exams/{id}/info`               | No     | Exam info for participate page |
| POST   | `/exams/{id}/register`           | Yes    | Register (authenticated)       |
| POST   | `/exams/{id}/register-public`    | No     | Register (public, returns token)|
| POST   | `/exams/{id}/start`              | Yes    | Start/resume exam              |
| GET    | `/exams/{id}/questions`          | Yes    | Get questions (legacy)         |
| POST   | `/exams/{id}/save-answer`        | Yes    | Save single answer             |
| POST   | `/exams/{id}/submit`             | Yes    | Submit exam                    |
| GET    | `/exams/{id}/my-result`          | Yes    | Get user's result               |
