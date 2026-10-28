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

## Chapter II: The Common Room

A second, dark-academia chapter at `/#/common-room`. The site opens on the dog-themed chapter list at `/#/chapters`
(any unknown address redirects there), and the first chapter lives at `/#/little-things`.

- **Questions and copy:** `shared/commonRoom.ts`. Each question has a stable `id` (this is what is stored, so never
  rename or reuse one), its text, and an optional follow-up for "A Little More Magic". Follow-ups are only shown,
  never stored. The server rejects any question id that is not in this list.
- **Storage:** `common_room_answers`, one document per person and question, with a unique index on
  `(ownerId, questionId)`. Editing updates that document and never makes a second one. It is kept apart from the
  Chapter I `responses` collection.
- **Who can see what:** each browser makes a random 256-bit secret key and keeps it in `localStorage`. Every request
  to `api/common-room.ts` must send it, and the database stores only a SHA-256 hash of it. A visitor without the key
  can read, change or delete nothing. The site owner reads answers in Atlas (`little_things.common_room_answers`).
  The key lives in the browser, so clearing site data, or using another browser, means the answers can no longer be
  opened from the page, though they stay in the database.
- **The villain:** after question 2 (`VILLAIN_AFTER_QUESTION` in `shared/commonRoom.ts`, named by question id)
  Voldemort, drawn from scratch in `DarkLord.tsx`, blocks the way. He has five points of health (`HEALTH` in
  `VillainDuel.tsx`), shown as a bar. A wand rises into view; each drag of it onto him lands a different spell and
  takes one point, the wand returns, and he sways side to side (faster as he weakens) so she has to follow him. The
  fifth spell defeats him and he says his last words in a chat box. Any move to a later question meets him
  first, every time the chapter is opened. The same single motion also
  works as one flick of the phone (`src/hooks/useWand.ts`: a push over 11 m/s² or a spin over 260°/s, both easy to
  retune), as a press of Enter on the wand, or as the "Cast the spell with a tap instead" button, so the chapter can
  always be finished. iPhones need a tap and a permission prompt before they share motion, and motion only works on
  https (or localhost).
- **Quidditch:** after question 7 (`SNITCH_AFTER_QUESTION`) a Golden Snitch darts around and must be tapped
  `SNITCH_TARGET` (10) times (`SnitchGame.tsx`). On the last catch Raven's hand closes on it too, he turns to look at her,
  `hand.mp3` starts, and they talk (`COMMON_ROOM_COPY.snitch`). The scene music stays until she leaves the chapter.
- **Saving:** nothing is sent while she answers. Everything typed is kept in the open page and sent together as soon
  as the last scene is over; the thank-you screen shows "saved" only after the server confirmed every answer, and
  offers a retry if it did not. Leaving before the end saves nothing.
- **The return:** after the last question he comes back, seen from the viewer's own eyes: he charges a
  spell, throws it at the screen, time freezes, and a stick figure named Raven steps in, blocks it, and asks if she is
  okay. The scene is `ReturnScene.tsx`, and the stages and their timings are the `SCHEDULE` at the top of that file.
  Every line of dialogue (his, Raven's, and her two replies) is in `COMMON_ROOM_COPY` in `shared/commonRoom.ts`. Her
  reply is not stored.
- **What is never recorded:** which questions were opened or skipped. That is held only in the open page.
- **Setup:** `npm run db:setup` also creates `common_room_answers` with its validation rules and index. The API
  creates the index itself on first use too, so the chapter works even if setup was not run.
