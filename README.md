# NestJS Events API

A robust, production-ready RESTful API built with **NestJS**, designed
for event management and task orchestration. This project implements
advanced security patterns, role-based access control (RBAC), and a
comprehensive testing suite.

---

## 🚀 Key Features

### 🔐 Global Authentication

JWT-based protection enabled globally with a **Public decorator** for
open access routes.

### 🛡 Role-Based Access Control (RBAC)

Fine-grained authorization using `@Roles()` decorator (`Admin` /
`User`).

### 👤 Data Ownership & Isolation

Secure resource management where users can only access their own tasks
via a custom `@CurrentUserId` decorator.

### 🗄 Database Management

PostgreSQL integration using **TypeORM** with a dedicated migration
system for schema versioning.

### ✅ Advanced Validation

Strict DTO validation using: - class-validator - class-transformer

### 🧪 Automated Testing

- **Unit Tests** --- business logic verification
- **E2E Tests** --- full authentication and task flow validation

---

## 🛠 Tech Stack

| Category         | Technology              |
| ---------------- | ----------------------- |
| Framework        | NestJS                  |
| Language         | TypeScript              |
| ORM              | TypeORM                 |
| Database         | PostgreSQL              |
| Linter           | ESLint (Strict config)  |
| Containerization | Docker & Docker Compose |

---

## � Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (v18 or higher recommended)
- **pnpm** (installed globally)
- **Docker** & **Docker Compose**

---

## �📦 Installation

```bash
pnpm install
```

---

## ⚙️ Configuration

### Environment Variables

```bash
cp .env.example .env
```

Update `.env`:

```env
APP_MESSAGE_PREFIX=PREFIX

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=DB_USERNAME
DB_PASSWORD=DB_PASSWORD
DB_NAME=tasks
DB_SYNCHRONIZE=0

JWT_SECRET=JWT_SECRET
JWT_EXPIRES_IN=JWT_EXPIRES_IN
```

---

## 🏃 Running the Application

### Option 1: Docker (Fastest)

The project is containerized for easy deployment.

```bash
# Build and start all services (API + PostgreSQL)
docker-compose up --build
```

### Option 2: Local Development

### Start PostgreSQL

```bash
docker-compose up -d
```

### Development Mode

```bash
pnpm run start:dev
```

### Production Build

```bash
pnpm run build
pnpm run start:prod
```

---

## 🗄 Database Migrations

```bash
pnpm run migration:run
pnpm run migration:revert
pnpm run migration:generate --name=MigrationName
```

---

## 🧪 Testing

```bash
pnpm run test
pnpm run test:e2e
```

---

## 🛣 API Endpoints

### 🔑 Auth

**Endpoint:** `/auth`  
Registration and Login (JWT generation).

---

### ✅ Tasks

**Endpoint:** `/tasks`  
CRUD operations with ownership enforcement.

---

### 👥 Users

**Endpoint:** `/users`  
Management and role-based actions.
