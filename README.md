# ⚡ Syndiq Fit — Precision Workout Programs Engineered For You

[![Next.js 15](https://img.shields.io/badge/Next.js-15.2.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)

**Syndiq Fit** is a production-grade, sports-science-driven workout engineering platform. Unlike simplistic fitness apps that randomly pick exercises or spit out generic routines, Syndiq Fit implements deterministic biomechanical slot assembly, volume balancing, joint-sparing injury contraindications, custom 32-piece equipment filters, dual-gender anatomical visualization, single-exercise replacement with duplicate prevention, and one-click PDF generation.

---

## 🎬 Demo Video & Live Showcase

Syndiq Fit includes a pre-recorded full end-to-end automated walkthrough showcasing the complete user journey:

* 🎥 **Live Demo Player**: Visit [`/demo`](http://localhost:3000/demo) in the running app to watch the video in high definition with chapter bookmarks and quick jump points.
* 📺 **Raw Video Asset**: Located at [`public/videos/syndiq-fit-demo.webm`](./public/videos/syndiq-fit-demo.webm) (13.1 MB, 1440×900 WebM/VP9).
* ⚡ **Streaming Endpoint**: Fast chunked video streaming with byte-range support via [`/api/video`](http://localhost:3000/api/video).
* 🤖 **Re-record On Demand**: Run `npm run demo:record` to execute the Playwright automation script and re-generate the walkthrough video automatically.

### Walkthrough Chapters in the Demo:
1. **Homepage & Features** (0:00 - 0:15) — Hero section, equipment overview, science engine highlights.
2. **Interactive Standalone Muscle Map** (0:15 - 0:40) — Dual-gender switcher (Male & Female silhouettes), Anterior/Posterior views, clickable muscle groups with real-time exercise filtering.
3. **Comprehensive Questionnaire** (0:40 - 1:15) — Goal, gender selection, age bracket, experience, frequency, session duration, joint injuries, and custom 32-piece equipment selection.
4. **Workout Generation & Dashboard** (1:15 - 1:40) — Science-based split assembly, volume/duration stats, muscle map locked to selected gender.
5. **Intelligent Exercise Replacement** (1:40 - 2:05) — Instant swapping preserving primary muscle targets, zero duplicate exercises on the same day, real-time duration recalculation.
6. **Vector PDF Export** (2:05 - 2:20) — Client-side generated PDF containing program specs, structured day breakdown, and progression guidance.

---

## 🔬 Sports-Science Engine Architecture

At the heart of Syndiq Fit is a deterministic workout generator (`src/engine/`) built upon established exercise physiology principles (ACSM, NSCA, and Renaissance Periodization guidelines).

### 1. Biomechanical Slot Assembler
Workouts are not built by random sampling. Each training session follows a strict physiological hierarchy:
* **Slot 1 (Primary Compound)**: High-recruitment multi-joint movements (e.g. Barbell Squat, Romanian Deadlift, Bench Press, Barbell Row) demanding peak neural drive.
* **Slot 2 (Secondary Compound)**: Complementary multi-joint exercises utilizing alternate angles or implements (e.g. Incline Dumbbell Press, Bulgarian Split Squat, Lat Pulldown).
* **Slot 3 & 4 (Isolation / Hypertrophy Targets)**: Single-joint movements isolating target musculature without systemic CNS exhaustion (e.g. Dumbbell Lateral Raise, Leg Curl, Pec Deck).
* **Slot 5+ (Stabilizers / Synergists / Core)**: Rotator cuff, core bracing, arms, or calves to complete the session volume.

### 2. Volume Formulas & Rep Allocations
Rep ranges, set counts, and rest periods dynamically adapt according to user goals:
| Goal | Rep Range | Sets per Exercise | Rest Period | Physiological Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Hypertrophy / Muscle Building** | 8 – 12 reps | 3 – 4 sets | 90 – 120s | Mechanical tension & metabolic stress |
| **Maximal Strength** | 4 – 6 reps | 4 – 5 sets | 150 – 180s | Neuromuscular adaptation & myofibrillar recruitment |
| **Fat Loss / Conditioning** | 12 – 15 reps | 3 sets | 45 – 60s | Elevated caloric expenditure & cardiovascular density |
| **General Fitness & Longevity** | 10 – 12 reps | 3 sets | 60 – 90s | Functional strength, mobility, and joint preservation |

* **Age-Adjusted Volume**: Lifters aged 51–60 and 61+ receive tailored volume scaling (-1 set on heavy compounds, +15-30s rest intervals, joint-friendly exercise prioritization).
* **Experience Scaling**: Beginners start with 2–3 sets per exercise with higher repetition targets (10–12 reps) for motor learning, while Advanced lifters receive progressive overload structures.

### 3. Fatigue & Push/Pull Balancing
* **48-Hour Recovery Windows**: Muscle groups trained heavily in Day 1 are shielded from compound re-engagement for at least 48 hours.
* **Agonist/Antagonist Ratio**: Push and Pull sets are balanced within 10% across the weekly cycle to prevent anterior shoulder dominance and postural drift.
* **Daily Duration Formulas**:
  $$\text{Duration} = \sum (\text{Sets} \times (\text{Time Under Tension} + \text{Rest Period})) + \text{Warmup Buffer}$$
  Sessions strictly conform to the user's selected 30, 45, 60, or 75+ minute windows.

---

## 🛡️ Joint Safety & Injury Contraindications

The engine enforces strict biomechanical restrictions across 6 common joint vulnerability zones:

* 🚨 **Shoulders (Impingement / Rotator Cuff)**: Replaces deep behind-the-neck presses, upright rows, and wide-grip dips with neutral-grip dumbbell presses, landmine presses, and chest-supported rows.
* 🚨 **Lower Back (Lumbar Disc / Spine Stress)**: Replaces standing bent-over barbell rows and conventional deadlifts with chest-supported machine rows, hip thrusts, and lat pulldowns.
* 🚨 **Knees (Patellar Tendon / Meniscus)**: Replaces deep quad-dominant barbell squats with leg presses (controlled depth), box squats, and Romanian deadlifts.
* 🚨 **Elbows (Epicondylitis / Triceps Tendon)**: Replaces skull crushers and heavy barbell curls with cable pushdowns and neutral-grip hammer curls.
* 🚨 **Wrists**: Prefers EZ-bars, dumbbells, and cable attachments over straight barbells to avoid extreme wrist extension.
* 🚨 **Neck**: Filters out overhead loading and direct cervical compressive exercises.

---

## 🧬 Dual-Gender Anatomical Muscle Visualizer

Syndiq Fit features a responsive, zero-layout-shift SVG muscle map engine:

* **Dual Anatomical Silhouettes**:
  * **Male Model**: Defined V-taper, shoulder width, and male muscular contours.
  * **Female Model**: Anatomically accurate female silhouette with natural breast/chest curvature, hourglass proportions, and accurate underlying pectoralis major highlighting (cosmetic tissue is not misidentified as a muscle group).
* **Two Operating Modes**:
  1. **Generated Program Mode** (`/program`): Automatically displays the silhouette matching the user's questionnaire gender. No confusing toggles; zero layout shifts.
  2. **Standalone Explorer Mode** (`/muscles`): Allows users to toggle freely between Male and Female views, flip between Anterior (Front) and Posterior (Back), and click any of the 14 muscle groups to filter exercises dynamically.
* **14 Clickable Muscle Groups**: Chest, Shoulders, Biceps, Triceps, Forearms, Upper Back, Lats, Lower Back, Core/Abs, Glutes, Quadriceps, Hamstrings, Calves, and Trapezius.

---

## 🏋️‍♂️ 32-Piece Flexible Equipment Library

Users can tailor their workout to any gym or home setup:

* **Free Weights**: Barbells, Dumbbells, Kettlebells, EZ Curl Bar, Weight Plates, Landmine Attachment.
* **Cable & Pulley**: Dual Cable Machine, Lat Pulldown Station, Seated Cable Row, Cable Crossover.
* **Gym Machines**: Smith Machine, Leg Press, Hack Squat, Leg Extension, Seated Leg Curl, Pec Deck / Fly Machine, Chest Press Machine, Shoulder Press Machine, Seated Dip Machine, Cable Calf Raise.
* **Bodyweight & Calisthenics**: Pull-Up Bar, Parallel Dip Bars, Adjustable Incline Bench, Flat Bench, Hyperextension / Roman Chair, Ab Wheel.
* **Accessories & Specialty**: Resistance Bands, Suspension Trainer (TRX), Foam Roller, Plyo Box, Battle Ropes, Trap / Hex Bar.

⚡ **Features**:
* One-click presets: *Commercial Gym (All Equipment)*, *Home Gym*, *Minimalist / Hotel*.
* Instant search and individual piece selection.
* **Guaranteed Equipment Enforcement**: Never suggests an exercise that requires an unselected piece of equipment.

---

## 🔄 Intelligent Exercise Replacement (Single-Exercise Swapper)

* **Target Preservation**: Replaces only the chosen exercise with an alternative targeting the exact same primary muscle.
* **No Accidental Duplicates**: Automatically excludes all exercises already scheduled for that workout day.
* **Constraint Compliance**: Only offers alternatives valid for the user's available equipment and joint safety limitations.
* **Instant Recalculation**: Workout volume and estimated duration update immediately.
* **PDF Consistency**: Customizations are preserved when downloading the PDF.

---

## 📁 Project Structure

```
Gym360/ (Syndiq Fit)
├── .github/                     # CI/CD workflows (optional)
├── public/
│   ├── videos/
│   │   └── syndiq-fit-demo.webm # 13.1 MB Playwright walkthrough video
│   └── images/
├── scripts/
│   ├── record-demo.mjs          # Automated end-to-end demo recorder
│   └── test-engine.mjs          # Headless engine verification script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── test-engine/     # Test runner API endpoint (5 lifter profiles)
│   │   │   └── video/           # Chunked video streaming API
│   │   ├── demo/                # Live video player with chapter markers
│   │   ├── muscles/             # Standalone interactive muscle map
│   │   ├── program/             # Active program dashboard & exercise swapper
│   │   ├── questionnaire/       # Multi-step intake form
│   │   ├── layout.tsx           # Root layout & navigation
│   │   └── page.tsx             # Homepage & landing showcase
│   ├── components/
│   │   ├── muscle-map/          # Male & Female SVG anatomical visualizers
│   │   ├── program/             # Exercise cards, swap modal, day selector
│   │   ├── questionnaire/       # Step indicators, equipment checklist, inputs
│   │   └── ui/                  # Badges, buttons, modals, cards
│   ├── data/
│   │   ├── exercises.ts         # Exercise database with biomechanical tags
│   │   ├── equipment.ts         # 32-piece equipment registry & presets
│   │   └── questionnaireOptions.ts # Options, goals, age, frequencies
│   ├── engine/
│   │   ├── programAssembler.ts  # Master program generator
│   │   ├── exerciseSelector.ts  # Biomechanical slot filter & scorer
│   │   ├── injuryRules.ts       # Joint contraindication filter
│   │   ├── volumeCalculator.ts  # Sets, reps, and rest allocation
│   │   ├── templates.ts         # Training split blueprints (2 to 6 days)
│   │   └── validator.ts         # 100-point sports-science audit engine
│   ├── lib/
│   │   ├── pdfGenerator.ts      # Client-side jsPDF exporter
│   │   └── storage.ts           # LocalStorage state management
│   └── types/                   # TypeScript interfaces and types
├── .gitignore                   # Next.js clean gitignore
├── package.json                 # Project configuration & npm scripts
├── tailwind.config.ts           # Tailwind CSS theme configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18.17.0 or higher (v20+ recommended)
* **npm**: v9+ (or pnpm / yarn)

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url> syndiq-fit
cd syndiq-fit
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Sports Science Engine Verification Tests
Syndiq Fit includes an automated test suite verifying 5 diverse lifter profiles (Beginner, Hypertrophy, Strength, Female Glute/Lower Focus, and Senior Joint-Sparing):
```bash
# Ensure server is running on port 3000, then:
npm run test:engine
```
Output:
```
--- RUNNING SYNDIQ FIT ENGINE VERIFICATION ---
All Tests Passed: true
Test 1: Beginner Full Body (3 Days) | Score: 95/100 | Equipment Valid: true
Test 2: Upper / Lower Hypertrophy (4 Days) | Score: 96/100 | Equipment Valid: true
Test 3: Push / Pull / Legs Strength (5 Days) | Score: 96/100 | Equipment Valid: true
Test 4: Female Glute & Posterior Chain (4 Days) | Score: 95/100 | Equipment Valid: true
Test 5: Senior Joint-Friendly (3 Days) | Score: 96/100 | Injury Valid: true
--- VERIFICATION SUCCESSFUL ---
```

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Re-record Demo Video (Optional)
```bash
npm run demo:record
```


## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
