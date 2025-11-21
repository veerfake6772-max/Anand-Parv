# Anand Parv — Registration (Next.js)

Simple Next.js app to register attendees for Anand Parv (Malad East, 15 Dec).

- Fields: Full name, Sabha (Yes/No). If `No`, collect reference name, relation, phone.
- Data stored in a local SQLite database at `data/registrations.db`.
- Admin page at `/admin` to view and export registrations as CSV.

Quick start (PowerShell):

```powershell
# install
npm install

# copy env file and set ADMIN_PASSWORD
copy .env.example .env.local
# edit .env.local and set ADMIN_PASSWORD=<your-password>

# initialize DB helper (not strictly required, lib/db will create DB on first request)
npm run prepare-db

# run dev server
npm run dev
```

Visit `http://localhost:3000` to register.
Visit `http://localhost:3000/login` to access the admin panel (requires password from .env.local).

Data / DB:
- The DB file is `data/registrations.db` (SQLite). You can open it with DB Browser for SQLite or use `sqlite3` CLI.

Authentication:
- Admin page (`/admin`) and edit/delete APIs require authentication.
- Set `ADMIN_PASSWORD` in `.env.local` (default: `admin123`).
- Login at `/login` with the password to get authenticated.
- Session stored as HttpOnly cookie; required for API calls.

Notes:
- Admin page available at `/admin` to view and export registrations as CSV.
- This is a minimal scaffold. If you want a production-ready deployment, we can switch to a managed DB (Postgres, MySQL) and add authentication or validation.

## Deployment to Vercel

**Important:** Vercel is serverless. SQLite databases don't persist across deployments. For production, use a managed DB.

### Option 1: Quick Deploy (with SQLite — data resets on redeploy)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel
```

Set `ADMIN_PASSWORD` in Vercel project settings → Environment Variables.

### Option 2: Production Deploy (with PostgreSQL)

1. Create a PostgreSQL database (e.g., via Neon, Railway, or Render).
2. Set `DATABASE_URL` environment variable in Vercel.
3. We can migrate the app to use PostgreSQL instead of SQLite.

Contact us for Option 2 migration help.

