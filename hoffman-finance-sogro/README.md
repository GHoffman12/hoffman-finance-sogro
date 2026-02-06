# Hoffman Finance – Sogro

**Hoffman Finance – Sogro** is a simple mobile‑first PWA intended to help a family control a monthly budget and calculate the number of extra work shifts (called _"dobras"_) needed to stay in the black.  The application is designed with the following goals:

- Administrators can log incomes, expenses and debts for a household.
- A viewer (for example, the user's father‑in‑law) can only see a summary panel showing the current month’s balance, the total extra shifts required, how many have been done and how many remain.
- The UI is optimized for iPhone usage: large text, few buttons and installable as a PWA.  It uses Next.js, TypeScript and TailwindCSS on the front end and Supabase for authentication, data storage and row level security.

## Features

- ✅ **Login with Supabase Auth** – email/password plus an option to enter as a viewer via a family code.
- ✅ **Admin panel** – record entries (`incomes`), expenses (`expenses`), debts (`debts`) and monthly settings such as base salary and average extra shift value.
- ✅ **Mobile dashboard** – summarises salary, extras, total expenses, instalments on debts and calculates whether extra shifts are required.  Displays the number of required extra shifts, how many have already been done and how many remain.
- ✅ **Row Level Security** – ensures each viewer only sees the panel associated with their admin.  Only admins can create or edit data.
- ✅ **PWA support** – includes a manifest and service worker to allow installation on the home screen of iOS devices.

This repository contains both the front‑end code (Next.js) and SQL scripts for Supabase.  It does not provide any credentials; you must set up your own Supabase project and add the environment variables described below.

## Getting Started

### Prerequisites

* **Node.js** – v18 or greater.  Install from <https://nodejs.org/>.
* **Supabase account** – create a project on <https://supabase.com/> and obtain the API keys and service role key.
* Optional: **Vercel account** for deployment.

### Environment Variables

Create a file called `.env.local` in the project root based off the provided `.env.local.example` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
# Edit .env.local and populate the values
```

Variables:

* `NEXT_PUBLIC_SUPABASE_URL` – URL of your Supabase instance.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` – public anon key used on the client.
* `SUPABASE_SERVICE_ROLE_KEY` – service role key used on the server when running migrations and RLS policies.

### Install Dependencies

From the project directory run:

```bash
npm install
```

### Database Setup

Run the SQL script in `supabase/migrations/01_init.sql` against your Supabase database.  You can do this via the Supabase SQL editor or the Supabase CLI.

```sql
-- Example using psql (substitute your database URL)
psql "<SUPABASE_DATABASE_URL>" -f supabase/migrations/01_init.sql
```

The script creates tables (`profiles`, `incomes`, `expenses`, `debts`, `settings_month`, `family_links`), sets up row level security and defines policies as described in the specification.

### Running Locally

```bash
npm run dev
```

Then open <http://localhost:3000> in your browser (or iPhone) to access the app.  You can create an admin account via the Supabase Auth sign‑up flow.  After signing in as admin you can invite a viewer using the **Share** page which generates a family code.

### Deploying to Vercel

1. Push this repository to a Git provider (GitHub, GitLab, etc.).
2. Create a new Vercel project and import the repository.
3. Add the environment variables on Vercel under **Project Settings → Environment Variables**.
4. Vercel will automatically build and deploy your Next.js app.

## Folder Structure

```
hoffman-finance-sogro/
├── components/        – shared React components such as Layout and Form wrappers
├── lib/               – Supabase client helper
├── pages/             – Next.js pages (index, panel, launch, config, share)
├── public/            – static assets including the PWA manifest
├── supabase/
│   └── migrations/    – SQL scripts for tables and RLS policies
├── tailwind.config.js – TailwindCSS configuration
├── next.config.js     – Next.js and PWA configuration
├── package.json       – dependencies and scripts
└── ...
```

## Contributing

Feel free to fork and adapt this project for your own family budgeting needs.  Pull requests are welcome for improvements!