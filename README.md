# Chat WebSocket App

A simple real‑time chat application built with **NestJS** (server) and **React + Vite** (client).  
The goal is to demonstrate a clean architecture for WebSocket communication, testing, logging, and Dockerized local/prod‑like environments.

---

## Features

- Multi‑room chat (e.g. `general`, `random`)
- Per‑room usernames stored only on the **frontend** (no persistent auth)
- Real‑time messaging via **Socket.IO**
- Unique usernames **per room** (duplicate usernames in the same room are rejected)
- List of active users with “typing” indicator
- Message history kept **in memory per room**:
  - system messages:
    - user joined
    - user left
    - user disconnected
  - user messages
- Active users list per room (with `isTyping` flag)
- Centralized error handling:
  - Global HTTP exception filter (`AllExceptionsFilter`)
  - Global WebSocket exception filter (`WsExceptionsFilter`) + unified `chat:error` payloads
- Logging via **Winston** with console + daily‑rotating file transport
- Swagger docs for HTTP API (`/api-docs`)
- Docker Compose setup for **development** and **production‑like** runs
- Tests:
  - Backend: **Jest** (unit + e2e)
  - Frontend: **Vitest** + React Testing Library
- Linting & formatting:
  - ESLint (flat config) + Prettier
  - Husky + lint‑staged on pre‑commit

---

## Tech Stack

### Backend

- **Node.js 24.x**
- **NestJS 11**
- **Socket.IO** (WebSocket transport)
- **Winston** + `winston-daily-rotate-file`
- **Swagger** (`@nestjs/swagger`, `swagger-ui-express`)
- **Jest** for unit & e2e tests

### Frontend

- **React 19**
- **Vite**
- **TypeScript**
- **MUI (Material UI)**
- **Socket.IO Client**
- **Redux Toolkit** for state management
- **Vitest** + React Testing Library for tests

### Tooling

- **ESLint 9** (flat config) + **Prettier**
- **Husky** + **lint-staged** (run lint + format on changed files before commit)
- **Docker** + **Docker Compose**

---

## Project Structure

```text
chat/
├─ .husky/                         # Husky hooks (pre-commit, etc.)
├─ client/                         # React + Vite frontend
│  ├─ node_modules/
│  ├─ public/
│  ├─ src/
│  │  ├─ __mocks__/
│  │  │  └─ socket.ts             # Mock for socket.ts (used in tests)
│  │  ├─ assets/
│  │  │  └─ react.svg
│  │  ├─ components/
│  │  │  ├─ __tests__/
│  │  │  │  ├─ ChatPage.integration.test.tsx
│  │  │  │  └─ UsernameForm.test.tsx
│  │  │  ├─ ActiveUsersList.tsx
│  │  │  ├─ ChatPage.tsx
│  │  │  ├─ ConnectionStatusChip.tsx
│  │  │  ├─ MessageInput.tsx
│  │  │  ├─ MessageList.tsx
│  │  │  ├─ RoomListPage.tsx
│  │  │  └─ UsernameForm.tsx
│  │  ├─ hooks/
│  │  │  └─ useTyping.ts
│  │  ├─ store/
│  │  │  ├─ __tests__/
│  │  │  │  ├─ chatSlice.test.ts
│  │  │  │  └─ userSlice.test.ts
│  │  │  ├─ chatSlice.ts
│  │  │  ├─ hooks.ts
│  │  │  ├─ index.ts
│  │  │  └─ userSlice.ts
│  │  ├─ types/
│  │  │  └─ chat.ts
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ setupTests.ts            # Vitest / RTL setup
│  │  ├─ socket.ts                # Socket.IO client
│  │  └─ test-utils.tsx           # Helpers for testing (renderWithProviders, etc.)
│  ├─ Dockerfile.dev
│  ├─ Dockerfile.prod
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
│
├─ server/                         # NestJS backend
│  ├─ dist/
│  ├─ logs/
│  ├─ node_modules/
│  ├─ src/
│  │  ├─ chat/
│  │  │  ├─ chat.dto.ts
│  │  │  ├─ chat.gateway.ts
│  │  │  ├─ chat.module.ts
│  │  │  ├─ chat.service.spec.ts
│  │  │  ├─ chat.service.ts
│  │  │  └─ chat.types.ts
│  │  ├─ common/
│  │  │  ├─ filters/
│  │  │  │  ├─ all-exceptions.filter.ts
│  │  │  │  └─ ws-exceptions.filter.ts
│  │  │  └─ pipes/
│  │  │     └─ ws-validation.pipe.ts
│  │  ├─ logger/
│  │  │  └─ winston.config.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.module.ts
│  │  └─ main.ts
│  ├─ test/
│  │  ├─ chat.ws.e2e-spec.ts
│  │  └─ health.e2e-spec.ts
│  ├─ jest-e2e.json
│  ├─ .gitignore
│  ├─ .prettierrc
│  ├─ Dockerfile.dev
│  ├─ Dockerfile.prod
│  ├─ eslint.config.mjs
│  ├─ nest-cli.json
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ README.md
│  └─ tsconfig.build.json
│
├─ .env                            # Shared env for Docker / local (optional)
├─ .env.local                      # Local overrides (gitignored)
├─ .gitignore
├─ .lintstagedrc.mjs
├─ .prettierrc.json
├─ docker-compose.yml              # Dev compose (uses Dockerfile.dev)
├─ docker-compose.prod.yml         # Prod-like compose (uses Dockerfile.prod)
├─ package.json                    # Root tooling (husky, lint-staged)
├─ package-lock.json
└─ README.md                       # This file
```

---

## Running Locally (without Docker)

This section covers running the app directly with Node + npm, which is typically the easiest way for development / debugging.

### 1. Prerequisites

- **Node.js 24.x (LTS)** installed  
  - Check: `node -v` → should start with `v24`.
- **npm** that ships with Node 24.
- **Git** (optional, but common).

You do **not** need a `.env` file for local development: both client and server have sensible defaults.

**Default local configuration:**

- **Server**
  - Port: `4000`
  - CORS origin: `http://localhost:5173`
  - Swagger: `http://localhost:4000/api-docs`
- **Client**
  - Port: `5173`
  - `VITE_SERVER_URL` default: `http://localhost:4000`

---

### 2. Install dependencies

At the repo root (for Husky / lint-staged hooks):

```bash
npm install
```

Then install server & client dependencies:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

You only need to do this once (or when dependencies change).

---

### 3. Run the backend (NestJS)

From the `server/` directory:

```bash
cd server

# Development mode (watch)
npm run start:dev

# Or plain start (no watch)
# npm run start
```

The server will start by default on `http://localhost:4000`.

Useful endpoints:

- Health check: `GET http://localhost:4000/health`
- Swagger docs: `http://localhost:4000/api-docs`

---

### 4. Run the frontend (React + Vite)

In a separate terminal, from the `client/` directory:

```bash
cd client
npm run dev
```

By default Vite will run at `http://localhost:5173`.

The app assumes the backend is available at `http://localhost:4000`.  
If needed, you can override this by creating `client/.env.local`:

```env
VITE_SERVER_URL=http://localhost:4000
```

---

## Running with Docker Compose

There are two Docker Compose setups:

- **Development**: hot‑reload, bind‑mount source code, `npm install` inside containers.
- **Production‑like**: multi‑stage builds, `npm ci`, running Vite preview & NestJS in production mode.

### 1. Dev Compose (`docker-compose.yml`)

From the repository root:

```bash
docker compose up --build
```

This will:

- Build `server` using `server/Dockerfile.dev`
- Build `client` using `client/Dockerfile.dev`
- Mount source code folders into containers for live development

Default exposed ports:

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`

To stop:

```bash
docker compose down
```

Logs (examples):

```bash
docker logs -f chat-server-dev
docker logs -f chat-client-dev
```

### 2. Prod‑like Compose (`docker-compose.prod.yml`)

From the repository root:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This will:

- Run NestJS server in production mode from its built `dist/`
- Build client with Vite in a separate stage and serve it via `npm run preview` in the container

Default exposed ports:

- Client: `http://localhost:5173` (mapped to container’s 4173)
- Server: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`

To stop:

```bash
docker compose -f docker-compose.prod.yml down
```

---

## Environment Variables

For most local runs, **you can skip env files** and stick to defaults.

However, both Docker Compose files support the following variables from `.env` at the repo root:

```env
# Server
SERVER_PORT=4000

# Client
CLIENT_PORT=5173

# URLs
SERVER_URL=http://localhost:${SERVER_PORT}
CLIENT_URL=http://localhost:${CLIENT_PORT}
VITE_SERVER_URL=${SERVER_URL}

# Logs (server)
LOG_DIR=logs

# Mode
NODE_ENV=development

# E2E tests (server)
E2E_HOST=localhost
```

You can copy `.env` → `.env.local` for local overrides (e.g. different ports).

---

## WebSocket Message Format

The chat uses **Socket.IO**. All events are namespaced with `chat:`.

### 1. Client → Server events

#### `chat:join`

Join a room with a username.

```ts
type JoinPayload = {
  roomId: string;   // e.g. "general"
  username: string; // required, non-empty
};
```

Server-side DTO: `JoinDto` (`class-validator` + `@ApiProperty` for Swagger).

#### `chat:leave`

Explicitly leave a room.

```ts
type LeavePayload = {
  roomId: string;
};
```

#### `chat:message`

Send a text message to a room.

```ts
type SendMessagePayload = {
  roomId: string; // or inferred from current client room
  text: string;
};
```

#### `chat:typing`

Indicate that user started / stopped typing.

```ts
type TypingPayload = {
  roomId: string;
  isTyping: boolean;
};
```

---

### 2. Server → Client events

#### `chat:history`

Sent once after a successful `chat:join` to provide existing room history.

```ts
type MessageType = 'message' | 'system';

interface BaseMessage {
  type: MessageType;
  text: string;
  timestamp: string; // ISO
  roomId: string;
}

interface UserMessage extends BaseMessage {
  type: 'message';
  username: string;
}

interface SystemMessage extends BaseMessage {
  type: 'system';
}

type ChatMessage = UserMessage | SystemMessage;

type ChatHistoryPayload = {
  roomId: string;
  messages: ChatMessage[];
};
```

#### `chat:message`

Broadcast of a new **user** message:

```ts
// payload is UserMessage
```

#### `chat:system`

Broadcast of a **system** message:

```ts
// payload is SystemMessage
// examples:
//  "<username> joined the chat"
//  "<username> left the chat"
//  "<username> disconnected"
```

#### `chat:users`

Current active users & typing status in a room:

```ts
type RoomUser = {
  id: string;        // socket.id
  username: string;
  isTyping: boolean;
};

type ActiveUsersPayload = {
  roomId: string;
  users: RoomUser[];
};
```

#### `chat:error`

Unified WebSocket error format, emitted by `WsExceptionsFilter` whenever a `WsException` is thrown in the gateway:

```ts
type ChatErrorPayload = {
  type: 'ws_error';
  event: string;     // e.g. "chat:join"
  message: string;   // human-readable description
  errors?: string[]; // optional validation errors from DTO validation
};
```

Example: duplicate username in a room:

```json
{
  "type": "ws_error",
  "event": "chat:join",
  "message": "Username already taken in this room"
}
```

---

## Testing & Linting

### Backend (server)

From `server/`:

```bash
# Unit tests (Jest)
npm test

# E2E tests (Jest + SuperTest + Socket.IO client)
npm run test:e2e

# Lint
npm run lint

# Lint + fix
npm run lint:fix
```

### Frontend (client)

From `client/`:

```bash
# Unit + integration tests (Vitest)
npm test

# Lint
npm run lint

# Lint + fix
npm run lint:fix
```

---

## Git Hooks (Husky + lint-staged)

At the repo root, Husky + lint‑staged are configured to:

- Run ESLint on **changed** files only
- Format them with **Prettier**
- Block commits if linting fails

Typical flow after cloning:

```bash
npm install      # installs husky + sets up .husky hooks
git commit ...   # triggers lint-staged on staged files
```

You can see the configuration in:

- `.lintstagedrc.mjs`
- `.husky/pre-commit`

---

## Notes & Further Improvements

- Currently, all chat data (messages, active users, client metadata) is stored **in memory**.
  - This is fine for the assignment / demo.
  - In a real production system, you would use a database or a cache (Redis, etc.) and handle horizontal scaling.
- Username uniqueness is enforced **per room** on the server via `ChatService.isUsernameTaken`.
- Validation for WebSocket DTOs is done via a custom `WsValidationPipe`, which converts `BadRequestException` from `class-validator` into a consistent `WsException` payload.
- Error handling is centralized:
  - HTTP errors → `AllExceptionsFilter`
  - WebSocket errors → `WsExceptionsFilter` + `chat:error` event

This README should be enough for a new developer to:

1. Install dependencies,
2. Run the app locally (with or without Docker),
3. Understand basic message formats and architecture,
4. Run tests and linting.
