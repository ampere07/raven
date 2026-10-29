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

## Chapter III: The High Seas

A pirate chapter at `/#/high-seas`, built the same way as Chapter II and sharing its `common_room_answers`
collection (every question id starts with `sea-`, so ids never clash).

- **Copy and questions:** `shared/highSeas.ts`: the 11 questions, the cannon fight's words, and Raven's final
  conversation. The last beat is the punchline ("Sinundan kita hanggang sa ibang theme.").
- **Davy Jones:** after question 4 (`CANNON_AFTER_QUESTION`) a cannon fight (`CannonDuel.tsx`). Tapping the water fires
  a ball at that spot and it hits only if he is still there; five hits sink him. The "Fire!" button always hits. The
  art (`DavyJones.tsx`) is original.
- **The maze and the jail:** after the last question, a new 20 by 20 maze (`MazeTrap.tsx`, different every time) walked
  with four arrow buttons or the arrow keys. Reaching its end springs Davy Jones's trap (`JailEscape.tsx`): she is in a
  cell, Raven comes to the bars (`hand.mp3` plays), breaks the lock, and they leave in a small boat. Then they talk
  (`FinaleTalk.tsx`, shared with Chapter II). "Skip na lang 'to" skips ahead at each step.
- **Every page is a scroll:** `SeaScroll.tsx` and `pirate.css` draw the pirate scroll that opens when a page appears.
- **Reaction GIFs:** `ReactionGif.tsx` shows Pirates of the Caribbean GIFs hosted by GIPHY (not copied into the project).
  A line picks one by key (`gif: 'regret'`). If one cannot load, it is simply not shown.
- **Jack the monkey:** `JackMonkey.tsx` is an original cartoon capuchin who runs a lap of every Chapter III page: along
  the floor, up the right wall, hanging from the scroll's top rod, down the left wall, along its bottom rod, and back.
- **Music:** `chapter3.mp3` plays throughout, except for `hand.mp3` once Raven appears at the cell.
- **Saving:** the same rule as Chapter II: all answers are saved together after the final scene.
