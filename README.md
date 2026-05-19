# Pixelle Center

AI Video Generation Platform - User Center

## Tech Stack

- **Monorepo**: Turbo
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Frontend**: Next.js 15 + Tailwind CSS
- **UI**: shadcn/ui + Radix UI
- **Auth**: NextAuth.js v5

## Getting Started

### 1. Start Infrastructure

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Update the `.env` file with your configuration.

### 4. Initialize Database

```bash
pnpm db:generate    # Generate Prisma Client
pnpm db:push        # Push schema to database
```

### 5. Start Development

```bash
pnpm dev
```

This will start:
- User Web: http://localhost:3000
- Admin Dashboard: http://localhost:3001

## Project Structure

```
pixelle-center/
├── apps/
│   ├── web/          # User frontend
│   └── admin/        # Admin dashboard
├── packages/
│   └── db/           # Prisma schema & client
└── docker-compose.yml
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps |
| `pnpm build` | Build all apps |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |
