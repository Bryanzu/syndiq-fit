# Project Instructions

## Project Overview

Syndiq Fit is a fitness web app. A questionnaire (goal, experience, schedule, equipment, injuries) feeds a rule-based engine that generates a weekly workout program. A second engine builds a 7-day meal plan from Nigerian recipes, sized to the user's calorie and protein targets, with a shopping list. Users can swap exercises and meals, run a workout in a full-screen player, browse a muscle map, export PDFs and share a program by link or QR code.

There are no accounts. Everything a user creates lives in their browser.

Repository: `Bryanzu/syndiq-fit` on GitHub.

## Architecture

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, `lucide-react` icons, `jspdf` for PDFs. Almost every page is a client component.
- **Backend:** Next.js route handlers only, in `src/app/api/`:
  - `feedback` stores and lists user feedback (admin key protected)
  - `test-engine` runs sample profiles through the workout engine
  - `video` serves the demo video file
- **Database:** none. User data is in `localStorage`; feedback is a JSON file at `data/feedback.json` (this will not persist on serverless hosting).
- **Authentication:** none for users. The feedback admin page uses a shared key from `ADMIN_FEEDBACK_KEY` in `.env.local`. The code still has a hard-coded fallback key and accepts the key in the URL; both should be removed.
- **API structure:** REST-style JSON from the route handlers above. The generators run in the browser, not on the server.

### Where things live

| Area | Path |
|---|---|
| Pages | `src/app/<route>/page.tsx` (home, questionnaire, program, meal-planner, muscle-map, feedback, settings, about, demo, disclaimer, admin/feedback) |
| Workout engine | `src/engine/` (`programAssembler`, `volumeRules`, `equipmentFilter`, `injuryRules`, `patternClassifier`, `workoutValidator`) |
| Meal engine | `src/engine/mealPlanner/` (`mealPlanGenerator`, `nutritionCalculator`, `shoppingList`) |
| Data | `src/data/` (134 exercises, split templates, equipment, 57 foods, 24 recipes) |
| Types | `src/types/` |
| Layout and navigation | `src/components/layout/` (`Navbar`, `TabBar`, `Footer`, `navItems`) |
| Shared UI | `src/components/ui/` (`Sheet`, `Toaster`, `InfoTooltip`, `ThemeToggle`) |
| Workout player | `src/components/workout/`, `src/context/WorkoutSessionContext.tsx`, `src/lib/workoutSession.ts` |
| Browser storage | `src/lib/storage.ts` (program, profile, meal plan, inventory), `src/lib/progress.ts` (workout log) |
| Design tokens | `src/app/globals.css` and `tailwind.config.ts` |

`localStorage` keys: `syndiq_active_program`, `syndiq_active_profile`, `syndiq_meal_plan`, `syndiq_meal_inventory`, `syndiq_workout_log`, `syndiq_workout_session`, `syndiq_theme`, `syndiq_admin_key`.

### How the engines work

- **Workout:** pick a split template by training frequency, then fill each slot by filtering exercises (equipment, injuries, age, dislikes) and ranking the rest. Sets, reps and rest are adapted per profile, and each day is tuned to the requested session length. The result is checked by `workoutValidator`.
- **Meals:** calculate targets (Mifflin-St Jeor, using the user's height), score recipes, rotate through each meal type's pool, then size each meal's portion (0.75x to 2x) so the day lands on the calorie target. Excluded foods are never used; a meal type with no allowed recipe is skipped and reported.

## Design Direction

The owner reviewed the first redesign and asked for something bolder. The approved direction is **glass over photography**:

- Full-bleed photos with frosted glass panels on top.
- One accent colour, lime, on a near-black ground. Dark theme first, light theme after.
- iOS feel: large bold titles, big rounded corners, 44px or larger touch targets, spring motion.
- A floating pill navigation on phones (round icon buttons; the active one stretches into a labelled pill), replacing the full-width tab bar.
- Strong motion: page transitions, cards that expand into detail screens, staggered lists, slide-to-start.
- A human-looking muscle map shaded by sets trained this week, with a tappable muscle list.
- Short, plain copy. Nothing that sounds machine-written or over-explained.

Mockups (first open, home, workout player, muscle map): https://claude.ai/artifact/QeuFs3jXawGWTMadnS2mKf

**Show a plan or mockup and get approval before building visual changes.**

### Redesign status

Done and merged to `main`: token-based design system, bottom tab bar, `Sheet` dialogs, toasts, skeleton loading, Inter font, workout player and mini player, engine fixes.

Not started, in the planned order:

1. Foundation: glass tokens, pill navigation, new phone header, motion library, page transitions
2. First-open screen and Home
3. Workout player restyle, with per-set weight and reps logging
4. Muscle map
5. Program, meal planner and questionnaire screens, plus the copy rewrite
6. Light theme

Open decisions for the owner: where exercise and meal photos come from (the project has only four images), and the artwork for the muscle figure.

## Development Rules

- Follow the existing architecture.
- Reuse existing components and utilities. In particular:
  - Every dialog goes through `Sheet`; do not hand-roll a modal.
  - Use `toast()` from `Toaster`, never `alert()`.
  - Use the primitives in `globals.css` (`.btn-primary`, `.btn-secondary`, `.btn-icon`, `.surface`, `.field`, `.chip`, `.t-title`, `.t-small`) and the `gym-*` colour tokens, not raw `zinc`/`white` classes.
  - Navigation items come from `navItems.ts`.
- Avoid unnecessary dependencies. Framer Motion is the one addition already agreed for the redesign.
- Follow existing naming conventions.
- Do not introduce breaking changes without approval. Saved `localStorage` data from older versions must still load.
- Keep the engines deterministic and free of UI code.
- Files have mixed line endings (some CRLF, some LF). Do not reformat whole files.

## Git Rules

- Each feature must use its own branch.
- Never commit directly to `main`.
- Do not merge another feature's branch without approval.
- Keep commits focused and descriptive.
- Do not commit `tsconfig.tsbuildinfo` (build cache).
- On this machine `gh` is not on the Bash PATH. Call it from PowerShell as `& "C:\Program Files\GitHub CLI\gh.exe"`.

## Testing

- Run relevant tests after making changes.
- Run type checks. Linting is not configured yet (`next lint` asks for first-time setup).
- Report any failures.
- Do not claim a feature is complete without verification.

Commands:

```bash
npx tsc --noEmit -p .
```

```bash
npx tsx scripts/test-comprehensive-qa.mjs
```

```bash
npm run dev
```

- The QA suite runs both engines and checks file structure; 22 checks should pass. It asserts that `TabBar.tsx` exists, `VideoModal` contains `z-[150]` and `ExerciseDetailModal` contains `z-[100]`, so update it when those change.
- `npm run test:engine` needs the dev server running on port 3000.
- For UI checks use Playwright (a dev dependency) against `http://localhost:3000`. The older Playwright scripts in `scripts/` predate the new navigation and may need updating. `test-new-features.mjs` looks for the text "Clear Active Workout Program?" and "Yes, Clear Program".
- A program can be loaded without the questionnaire through a share link: `/program?p=<base64 of the profile JSON>`.
- The dev server prints an SWC "not a valid Win32 application" warning; the app still compiles.

## Coordination

- Avoid changing files owned by another feature.
- Identify shared-file dependencies before implementation.
- Communicate any architectural changes or conflicts.

Sessions are split by feature, so check these shared files before editing and say so if you need to change them:

- `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`
- `src/components/layout/*` and `src/components/ui/*`
- `src/types/*`, `src/lib/storage.ts`, `src/lib/progress.ts`
- `src/context/WorkoutSessionContext.tsx`
- `scripts/test-comprehensive-qa.mjs`

Rough ownership by feature: workout generation (`src/engine/*.ts`, `src/data/exercises.ts`, `templates.ts`, `equipment.ts`), meal planning (`src/engine/mealPlanner/`, `src/components/mealPlanner/`, `src/app/meal-planner/`), workout player (`src/components/workout/`), muscle map (`src/components/body/`, `src/app/muscle-map/`), program page (`src/components/program/`, `src/app/program/`).

## Known Gaps

- Sessions can still estimate a little under the requested length.
- Two of the three meal budget levels (`moderate`, `flexible`) have no effect.
- There is no week-to-week progression in workout programs.
- The skipped-meal notice appears inside the protein shortfall report.
- The mini player overlaps the bottom of page content on phones.
- Exercises have no photos or embedded videos (`youtubeId` is empty; demos open a YouTube search).
- `QuestionnaireWizard.tsx` and `MealPlannerWizard.tsx` are very large and should be split before restyling.
