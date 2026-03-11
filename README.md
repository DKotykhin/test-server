# Test Server

![Node.js](https://img.shields.io/badge/Node%2Ejs-339933?style=flat&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-latest-DC382D?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

A RESTful API backend built with **Fastify** and **TypeScript**, featuring user authentication, account management, and multi-language menu management.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify v5
- **Database**: PostgreSQL via Drizzle ORM
- **Cache / Queue**: Redis + BullMQ
- **Auth**: JWT + bcryptjs
- **Email**: Mailgun (async via BullMQ)
- **Docs**: Swagger UI (`/docs`)
- **Testing**: Mocha + Chai

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL, Redis, Adminer)

### Setup

```bash
# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env

# Start infrastructure
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The server starts on `http://localhost:4004` by default.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | | `4004` | Server port |
| `NODE_ENV` | | `development` | Environment |
| `FRONT_URL` | | `http://localhost:3000` | Frontend URL for email links |
| `DB_URL` | ✓ | | PostgreSQL connection string |
| `REDIS_URL` | ✓ | | Redis connection URL |
| `JWT_SECRET` | ✓ | | JWT signing secret |
| `JWT_EXPIRES_IN` | | `1d` | JWT expiration time |
| `EMAIL_API_KEY` | ✓ | | Mailgun API key |
| `EMAIL_DOMAIN` | ✓ | | Mailgun email domain |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload |
| `npm run start` | Build and start production server |
| `npm test` | Run tests |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema directly to database |

## API Endpoints

### Health

```
GET /health/app        Application health
GET /health/redis      Redis connection health
```

### Auth

```
POST  /auth/sign-up                       Register new user
POST  /auth/sign-in                       Login, returns JWT
GET   /auth/me                  [auth]    Get current user
GET   /auth/verify-email?token=<token>    Verify email address
POST  /auth/resend-verification-email     Resend verification email
POST  /auth/request-password-reset        Request password reset
POST  /auth/set-new-password              Set new password with reset token
```

### Users

```
POST   /user/:id/confirm-password    Verify current password
PATCH  /user/:id/update-password     Update password
PATCH  /user/:id/update-name         Update name
DELETE /user/:id                     Delete account
```

### Menu

```
GET /menu?language=EN|UA|RU    Get menu categories and items by language
```

API documentation is available at **`/docs`** (Swagger UI).

## Project Structure

```
src/
├── auth/          Controllers, services, and types for authentication
├── users/         User management logic
├── menu/          Menu management with Redis caching
├── routes/        Fastify route definitions
├── db/schema/     Drizzle ORM table schemas
├── validation/    Request/response JSON schemas
├── utils/         Shared utilities (error handling, email, queue, etc.)
└── server.ts      App entry point
drizzle/           Database migrations
docker-compose.yml PostgreSQL + Redis + Adminer
```

## Database Schema

- **users** — accounts with roles (`user`, `admin`, `moderator`, `guest`), ban support, email verification status
- **email_verifications** — time-limited email verification tokens
- **reset_password** — time-limited password reset tokens
- **menu_categories** — menu sections with multilingual titles (EN, UA, RU)
- **menu_items** — items linked to categories with price and language

## Key Features

- JWT authentication with HTTP-only cookies
- Email verification and password reset flows
- Async email delivery via BullMQ worker
- Redis caching for menu data (1-minute TTL)
- Multilingual menu (English, Ukrainian, Russian)
- Auto-generated OpenAPI docs
- Startup health checks for PostgreSQL and Redis
