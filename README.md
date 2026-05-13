# Real Estate Listing Intake Form

A Vercel + Next.js app for real estate agents to submit complete property listings with required documentation.

## What it does

- Agents fill a web form.
- Required fields are checked in the browser and again on the server.
- Required files are uploaded to Supabase Storage.
- A property record is created in Supabase.
- Optional Make.com webhook can create a CRM property card.

## Tech stack

- Next.js
- Vercel
- Supabase Database
- Supabase Storage
- Optional Make.com / CRM webhook

## Setup

### 1. Create a new GitHub repo

Create a new empty repository, then upload these files.

### 2. Install locally

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

### 3. Create Supabase project

In Supabase:

1. Create a new project.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Go to Storage.
5. Create a private bucket named:

```text
property-documents
```

### 4. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add:

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
MAKE_WEBHOOK_URL=optional_make_webhook_url
```

Important: never expose the service role key publicly. Only use it server-side.

### 5. Deploy to Vercel

1. Push the repo to GitHub.
2. Import it in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

## CRM automation

Use `MAKE_WEBHOOK_URL` to send the completed listing to Make.com.

The webhook receives:

- property info
- owner info
- agent info
- status: `READY_FOR_PIPELINE`
- uploaded file metadata

From Make.com, connect to your CRM and create the property card.

## Status logic

Incomplete submissions are rejected.

Complete submissions are saved as:

```text
READY_FOR_PIPELINE
```
