# Playbook

[![CI](https://github.com/anniiebaii/playbook-app/actions/workflows/ci.yml/badge.svg)](https://github.com/anniiebaii/playbook-app/actions/workflows/ci.yml)

**Playbook** is a knowledge base where sales and business leaders ask questions and get answers
from verified expert advisors. Answered questions build up into a searchable library of
practical leadership advice.

_Playbook is a fun little side project I built for a friend._

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**
(Postgres, Auth, and an auto-generated REST API), with the schema defined in **Prisma**.

Side project intended for personal usage. 

> For the architecture, data model, and design trade-offs, see the
> [**High-Level Design document**](docs/DESIGN.md).

![Playbook home page: search, topic filters, and the trending question feed](docs/screenshots/home.jpg)

## Features

- **Question feed** with trending, recent, and unanswered views, topic filters, and search
- **Expert directory** with profiles, plus the option to direct a question to a specific
  expert
- **Expert answers**, with questions marked answered automatically
- **Upvotes and bookmarks**, limited to one per user per question by database constraints
- **Email and password accounts** through Supabase Auth, with sessions that persist across
  reloads
- **Admin dashboard** for experts: statistics, a pending-question queue, recent activity,
  question moderation (delete questions), and member management (deactivate or
  permanently delete accounts)
- **Accessible UI**: labelled forms, keyboard-closable dialogs, and ARIA state on toggle
  buttons

## A tour of Playbook

The screenshots below use the seeded sample data (`npm run db:seed`).

### Browse and search

Anyone can browse without an account. The feed, shown above, sorts by **Trending** (most
upvoted), **Recent**, or **Unanswered**, and can be narrowed by topic or by a search across
question text and authors. Each card shows who asked, when, how many views it has, and whether
an expert has answered. Signing in unlocks asking questions, upvoting, and bookmarking.

### Read expert answers

Opening a question shows its full details and every answer in order. Answers from expert
advisors carry a shield badge. Experts can answer right from this view, which marks the
question as answered.

![A question with two expert answers](docs/screenshots/question-detail.jpg)

### Meet the experts

The expert directory lists each advisor's title, rating, typical response time, bio, and areas
of expertise. Members can open a profile or send a question to a specific expert, and it
appears in the admin queue assigned to that expert.

![The expert advisor directory](docs/screenshots/experts.jpg)

### Sign in from any device

Accounts use email and password through Supabase Auth, and sessions persist across page
reloads. Guests can keep browsing without an account. The layout adapts down to phone widths.

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/sign-in.jpg" alt="Sign-in page" height="440" /></td>
    <td align="center"><img src="docs/screenshots/mobile.jpg" alt="Question feed on a phone" height="440" /></td>
  </tr>
</table>

### Admin dashboard

Experts get an admin dashboard with counts of questions, pending questions, members, and total
views, plus recent activity. Each card jumps straight to the matching list.

![Admin dashboard overview](docs/screenshots/admin-dashboard.jpg)

### Moderate questions

The **Questions** tab lists every question with a status filter. Experts can open a question
to answer it, or delete it. The confirmation lists exactly what will be removed along with
the question, and a Row Level Security policy ensures only experts can delete.

![Confirming deletion of a question](docs/screenshots/admin-delete-question.jpg)

### Manage members

The **Users** tab lets experts **deactivate** an account, which blocks sign-in and ends the
user's sessions but keeps their content. Experts can also **delete** an account permanently,
along with everything that user created. Both actions run as expert-only database functions.

![User management with Deactivate and Delete actions](docs/screenshots/admin-users.jpg)

## Tech stack

| Area     | Tools                                                                                  |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS, lucide-react                        |
| Backend  | Supabase: Postgres with Row Level Security, PostgREST, Auth                            |
| Schema   | Prisma                                                                                 |
| Quality  | ESLint (type-aware strict rules), Prettier, Vitest, Testing Library, GitHub Actions CI |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20.19+ or 22.12+ (the repo's `.nvmrc` pins 24)
- A [Supabase](https://supabase.com) project (the free tier is enough)

### 1. Set up the database

Apply the Prisma schema to your Supabase Postgres database:

```bash
cd backend
cp .env.example .env   # then set DATABASE_URL from Supabase: Project Settings -> Database
npm install
npm run db:push       # create tables from the Prisma schema
npm run db:policies   # enable Row Level Security and apply access policies
npm run db:functions  # expert-only account management (deactivate, delete)
npm run db:seed       # optional: sample questions, answers, and experts for demos
```

The policies and functions live in `backend/sql/`; see
[Security model](docs/DESIGN.md#8-security-model). To make a user an expert advisor, set
`isAdmin = true` on their row in the `users` table.

The sample data uses fictional `@demo.example.com` people who can't sign in. Re-running
`npm run db:seed` refreshes it, and `npm run db:seed:remove` deletes it along with everything
attached to it.

### 2. Run the frontend

```bash
cd frontend
cp .env.example .env   # then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open <http://localhost:5173>.

> The Supabase anon key is safe to use in the browser: data access is enforced by Row Level
> Security. Keep your `.env` files out of version control anyway; they are git-ignored.

## Scripts

Run these from `frontend/`:

| Command              | Description                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Start the dev server with hot reloading          |
| `npm run build`      | Type-check and build for production into `dist/` |
| `npm run preview`    | Serve the production build locally               |
| `npm test`           | Run the test suite once                          |
| `npm run test:watch` | Run tests in watch mode                          |
| `npm run lint`       | Lint with ESLint                                 |
| `npm run typecheck`  | Type-check with the TypeScript compiler          |
| `npm run format`     | Format the code with Prettier                    |

## Project structure

```text
playbook-app/
├── backend/                 Database schema (Prisma) for Supabase Postgres
│   └── prisma/schema.prisma
├── docs/
│   ├── DESIGN.md            High-level design document
│   └── screenshots/         Images used in this README
├── frontend/                React single-page app
│   └── src/
│       ├── api/             Data access, one module per resource
│       ├── components/      Presentational UI components
│       ├── context/         Auth provider
│       ├── hooks/           Data and state hooks
│       ├── pages/           Full-screen views
│       ├── types/           Domain models and database schema types
│       └── utils/           Pure helper functions
└── .github/workflows/ci.yml Lint, test, and build on every push
```
