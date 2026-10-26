# Little Things About You

A single page with a short questionnaire. Her answers are saved to MongoDB Atlas.

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide icons.
- **Saving answers:** one Vercel function, `api/responses.ts`. Browsers cannot talk to MongoDB directly, and the
  connection string must never ship in frontend code, so the function is the only thing that holds it.
- **Reading answers:** in MongoDB Atlas, open **Browse Collections** and look at `little_things.responses`.
  The site itself never reads or shows saved answers, so no login is needed.

## Setup

1. Rotate the Atlas database password if it was ever shared, then copy `.env.example` to `.env.local` and fill in
   `MONGODB_URI`.
2. `npm install`
3. `npm run db:setup` creates the `responses` collection with validation rules and an index.
4. `npm run dev` runs the site and the API together at http://localhost:5173.

## Deploying to Vercel

1. Import the repo in Vercel.
2. Add `MONGODB_URI` (and optionally `MONGODB_DB`) under **Settings → Environment Variables**.
3. In Atlas **Network Access**, allow `0.0.0.0/0`. Vercel functions do not have fixed IP addresses; the database is
   still protected by its username and password.

## Editing the questions

All questions live in `shared/questionnaire.ts`. The browser form and the server validation both read from it.
