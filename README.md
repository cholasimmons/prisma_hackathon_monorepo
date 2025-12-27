# Plates — Full-Stack Monorepo on the BEST Stack

**Plates** is a full-stack, production-ready **open-source monorepo** built to demonstrate how to design, deploy, and operate a modern web application using what I call **the BEST stack**:

> **Bun · Elysia · SvelteKit · Tailwind**

Originally started as a submission for the **Prisma Hackathon**, the project outgrew the deadline and evolved into an educational, real-world reference for developers who want to see how all the pieces fit together — from local development to a live VPS deployment.

🔗 **Live demo:** https://plates.simmons.studio

---

## Why This Project Exists

The Prisma Hackathon required the use of at least one of:
- **Prisma**
- **Deno**
- **BetterAuth**
- **TanStack Tables**

While the project could not be completed in time for submission, it became clear that the architecture and tooling were valuable on their own. Rather than abandon it, Plates was continued as an **open-source learning resource** showing:

- How to structure a **modern TypeScript monorepo**
- How to deploy a real system to a **Linux VPS**
- How to combine **auth, storage, caching, ORM, and UI** cleanly
- How to avoid framework lock-in and over-engineering

---

## Stack Overview

### Runtime & Backend
- **Bun** — ultra-fast JS runtime and package manager
- **Elysia** — high-performance Bun-native web framework
- **Prisma ORM** — type-safe database access
- **PostgreSQL** — primary relational database
- **Redis** — caching, sessions, and ephemeral data
- **BetterAuth** — authentication and session handling
- **MinIO** — S3-compatible object storage

### Frontend
- **SvelteKit** — app framework
- **Svelte 5 (Runes)** — state and reactivity
- **Tailwind CSS** — utility-first styling
- **@humanspeak/svelte-headless-table** — admin tables (sorting, pagination, actions)

### Infrastructure & Deployment
- **Ubuntu 24.04 VPS (Contabo)**
- **Coolify** — self-hosted PaaS for deployment
- **Docker** — containerized services
- **PostgreSQL, Redis, MinIO** running as managed services via Coolify

---

## Monorepo Structure

```text
plates/
├── apps/
│   ├── web/                # SvelteKit frontend (Svelte 5 + Tailwind)
│   │   ├── .env.example    # Environment variable template
│   │   ├── Dockerfile      # Dockerfile for web app
│   │   └── package.json    # Web-specific configuration
│   │
│   └── api/                # Elysia backend (Bun runtime)
│       ├── .env.example    # Environment variable template
│       ├── Dockerfile      # Dockerfile for API app
│       └── package.json    # API-specific configuration
│
├── node_modules/
├── bun.lock                # Bun lockfile
├── bun-workspace.toml      # Bun workspace configuration
├── bunfig.toml             # Bun configuration file
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Workspace configuration
└── README.md               # Project documentation
```


> The monorepo is designed to keep **domain logic, types, and infrastructure reusable** across services.

---

## Features

- ✅ Full authentication flow (BetterAuth)
- ✅ Admin dashboard with sortable & paginated tables
- ✅ Role-based access control
- ✅ Prisma-backed PostgreSQL models
- ✅ File uploads via MinIO
- ✅ Redis-powered caching
- ✅ SSR + SPA hybrid frontend
- ✅ Production deployment on a VPS

---

## Admin Tables

The admin interface uses  
**`@humanspeak/svelte-headless-table`** instead of TanStack Tables due to Svelte 5 compatibility.

Tables support:
- Sorting
- Pagination (lazy loading)
- Custom action buttons per row
- Clickable cells for modal inspection
- Full control over rendering (headless)

---

## Running Locally

### Requirements
- **Bun**
- **Docker**
- **PostgreSQL / Redis / MinIO** (or Docker equivalents)

### Install
```bash
bun install
```

### Environment

Copy and configure:
```bash
cp .env.example .env
```

### Prisma

Generate and migrate database
```bash
bun prisma:generate
bun prisma migrate dev
```

### Start Development
```bash
bun dev
```