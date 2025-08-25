# Newsletter App

A simple full-stack newsletter platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.
Supports authoring posts, public reading, subscriber management, scheduling, and mocked email notifications.

---

## Quick Start

```bash
# Install deps
npm install

# DB setup (adjust creds as needed)
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/newsletter_db"' > .env

# Run migrations + seed
npx prisma migrate dev --name init
npx prisma db seed

# Start dev server
npm run dev
```

- **Homepage** → http://localhost:3000
- **Admin** → http://localhost:3000/admin
- **Subscribers** → http://localhost:3000/admin/subscribers

---

## Features

- **Post authoring** (create, edit, delete, schedule)
- **Public post viewing** with SEO-friendly slugs
- **Newsletter subscription flow**
- **Scheduled publishing**
- **Email notifications** (mocked – logs to console)

---

## Tech Stack

- **Next.js 14** → App Router, SSR for public pages, API routes for backend logic
- **Prisma** → type-safe DB access, migrations, and schema clarity
- **PostgreSQL** → reliable relational store for posts + subscribers
- **Tailwind CSS** → quick styling without heavy design effort
- **TypeScript** → maintainable, safe code

---

## Trade-offs

- **Emails mocked** → console logs instead of real provider (SendGrid/Postmark would slot in easily).
- **No auth** → out of scope per assignment. Admin pages assume trusted access.
- **CSR for admin** → better UX for forms; SEO not required.
- **Inline email sending** → no job queue. Fine for demo; would use Redis + BullMQ in production.

---

## Future Improvements

- **Auth with NextAuth.js**
- **Real transactional email integration**
- **Background jobs for bulk delivery**
- **Unsubscribe management + better templates**
- **Analytics** (opens, clicks, subscriber growth)

---

## Deployment Notes

If deployed to production:
- **Vercel** for hosting (optimal for Next.js)
- **Supabase / Neon** for managed PostgreSQL
- **SendGrid / Postmark** for email
- **Redis + BullMQ** for job queue
- **Sentry** for error monitoring

---

## Test the Flow

1. **Subscribe** on the homepage
2. **Create a new post** in `/admin/new`
3. **Publish** → check console for mocked email logs
4. **Schedule a future post** → then call `/api/posts/scheduled` to trigger delivery
