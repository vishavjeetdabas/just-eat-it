# JUST EAT IT — Complete App Context Document

> Use this document to give full context to any AI model working on this project.
> It covers: who it's for, what it does, how it was built, design requirements, features, data model, file structure, and known issues.

---

## 1. WHO IS THIS FOR?

- **User**: Sunny (Vishavjeet Dabas)
- **Age**: 21 years old
- **Stats**: 89kg, 183cm, Eggetarian, Founder (busy schedule)
- **Goal**: Body recomposition (lose fat + build muscle) in 1 month before a Bali trip
- **Training**: 6 days/week (evening gym), 1 rest day (Sunday default)
- **Diet**: Based on a custom diet plan document (`Sunny_Bali_DietPlan_v2.docx`)
- **Diet core**: 12 eggs/day + 2 whey shakes + minimal cooking

---

## 2. WHAT IS THIS APP?

**Just Eat It** is a premium, mobile-first meal tracker web app built specifically around Sunny's Bali recomp diet plan. It is NOT a generic calorie counter — it is hardcoded to Sunny's exact meal plan, macros, and schedule. The user checks off meals, tracks water/sleep/workouts, and monitors their transformation progress over 4 weeks.

### App Name: "Just Eat It"
### Logo: `public/logo.png` — Black background, white "Just" text with fork & spoon icons, orange citrus slice. The logo drives the entire color palette.

---

## 3. DESIGN REQUIREMENTS (CRITICAL — DO NOT DEVIATE)

### Color Palette
- **Primary**: Black (`#0A0A0A` dark, `#F2F2F7` light)
- **Accent**: Orange (`#FF6B00` dark, `#FF6B00` light)
- **Text**: White/off-white in dark mode, black in light mode
- **Only 3 colors**: Black, White, Orange. No other colors except for status indicators (green for success, red for danger).

### Style
- **Apple-style aesthetic** — inspired by iOS/iPadOS design language
- **Glassmorphism** — cards use `backdrop-filter: blur(24px)` with semi-transparent backgrounds
- **Glow effects** — orange glow (`box-shadow`) on accent elements and active states
- **Premium typography** — Inter font from Google Fonts, tight letter-spacing, heavy weights (700-900) for numbers
- **Minimalistic** — clean, lots of whitespace, no clutter
- **Animations** — smooth micro-animations everywhere:
  - Progress rings animate on fill (1s ease)
  - Checkmarks bounce on tap (`checkBounce` keyframe)
  - Cards fade in with stagger delays
  - Flame emoji animates on streak
  - Water fill level animates smoothly
  - Page transitions use fadeIn/fadeInUp

### Both Modes Must Look Premium
- **Dark mode** (default): Deep black background, glass cards with subtle white borders, orange accents glow
- **Light mode**: Soft grey-white background, glass cards with subtle shadows, orange accents pop

### Mobile-First
- Optimized for **iPhone (iOS 26)** — 390×844 viewport
- Max-width: 430px, centered on larger screens
- Uses `env(safe-area-inset-*)` for notch/home indicator spacing
- Bottom navigation (5 tabs) with glass blur effect
- Touch-optimized: 44px minimum tap targets, `-webkit-tap-highlight-color: transparent`
- No horizontal scrolling

---

## 4. TECH STACK

| Layer | Technology |
|---|---|
| Build tool | Vite 6 |
| UI framework | React 19 |
| Routing | React Router DOM v7 |
| Styling | Vanilla CSS (CSS custom properties for theming) |
| Persistence | localStorage (key: `justeatit_data`) |
| Fonts | Inter (Google Fonts CDN) |
| Charts | Custom SVG/CSS (no chart library) |
| Icons | Emoji-based (no icon library) |

### No external UI libraries. No Tailwind. No chart libraries. Everything is custom.

---

## 5. COMPLETE FEATURE LIST

### 5.1 Dashboard (Home — `/`)
- **Personalized greeting**: "Good Morning/Afternoon/Evening, Sunny 🔥" with current day name
- **Logo** in top-right corner (44×44px, rounded)
- **Prep reminders banner**: Shows "🥚 Hard-boil eggs today!" if last prep was 2+ days ago, and "🍛 Batch cook dal!" on Sundays. Orange left border accent.
- **Training/Rest Day toggle**: Pill-style toggle. Training = shows all 4 meals (2,650 kcal). Rest = shows 3 meals (2,280 kcal, skips pre-workout meal, reduces lunch). Auto-detects Sunday as rest day, but user can override.
- **Macro progress section** (glass card with glow):
  - Header: "Today's Progress" with consumed/target kcal + remaining calories in large orange number
  - 3 animated SVG progress rings: Protein (orange), Carbs (white), Fats (grey)
  - Rings fill as meals are checked. Each ring shows value/target below.
- **Quick stats row** (3 glass cards in a grid):
  - 🔥 Streak counter (animated flame emoji)
  - 💧 Water tracker (tap to add, right-click to remove, shows fill level animation in background)
  - 💤 Sleep tracker (number input for hours)
- **Meal cards section**: "Today's Meals" header, then 4 (or 3 on rest day) expandable meal cards:
  - Each card shows: emoji, meal name, time, prep time, calories, and a circular check button
  - Tapping the check button marks meal as eaten (green bounce animation, card border turns green)
  - Tapping the card header expands it to show: macro pills (P/C/F) and individual food items with protein/calories
  - Checking meals updates the macro rings in real-time

### 5.2 Calendar (`/calendar`)
- **Monthly grid** (7 columns for S-M-T-W-T-F-S)
- Each day is color-coded:
  - Green: all meals checked
  - Orange: partial (some meals checked)
  - Grey: logged but no meals
  - Empty: no data
- Today has an orange ring outline
- **Navigation**: prev/next month arrows
- **Legend**: Shows what each color means
- **Day detail**: Tap a day to expand a card showing: date, training/rest badge, water count, sleep hours, and individual meal status (✅/❌)

### 5.3 Progress (`/progress`)
- **Weekly Summary card** (glass card with glow):
  - Meals completed %, streak count, avg water/day, avg sleep
  - Weight change (green if negative/losing, orange if positive)
- **Weekly Weigh-in**:
  - Number input + "Log" button
  - Bar chart showing last 8 weigh-ins (animated orange gradient bars)
  - Each bar shows weight value and date
- **Progress Photos**:
  - Camera capture button (uses device camera via `<input type="file" capture>`)
  - Images compressed to 400px width, JPEG 60% quality, stored as base64 in localStorage
  - Photo grid showing last 6 photos
  - Before & After comparison: first photo vs latest photo side-by-side with orange border glow

### 5.4 Workout (`/workout`)
- **Today's Session** logger:
  - If not logged: 5 workout type buttons in a 3-column grid (Push 🏋️, Pull 💪, Legs 🦵, Cardio 🏃, Abs/Core 🧘)
  - Duration input (minutes)
  - Estimated calories burned (calculated: type's cals/min × duration × bodyweight factor)
  - "Log Workout" button
  - If already logged: Shows green success card with workout details
- **This Week** stat: Total calories burned from workouts in the last 7 days
- **History**: List of last 14 workouts with emoji, type name, date, duration, and calories

### Calorie burn rates per minute:
- Push: 6.5 cal/min
- Pull: 6.0 cal/min
- Legs: 7.0 cal/min
- Cardio: 8.0 cal/min
- Abs/Core: 5.0 cal/min

### 5.5 Settings (`/settings`)
- **Profile card**: Logo + name + stats + "Bali Recomp Plan — 1 Month"
- **Theme toggle**: Custom toggle switch (dark mode = orange track, light mode = grey track)
- **Prep tracking**: Mark egg prep and dal prep as done with date tracking
- **Quick references** (collapsible accordion sections):
  - 📋 Daily Schedule (times + actions from diet plan)
  - 💊 Supplements (Atom Whey ×2, ON Creatine, Water)
  - 📊 Macro Targets (training vs rest day comparison)
- **Data management**:
  - 📤 Export Backup (downloads JSON file)
  - 🗑️ Clear All Data (with confirmation dialog)
- **Footer**: Logo + version + tagline

---

## 6. THE DIET PLAN DATA

### Training Day (6 days/week) — Target: 2,650 kcal
| Macro | Grams | Calories | % |
|---|---|---|---|
| Protein | 194g | 776 kcal | 29% |
| Carbs | 310g | 1,240 kcal | 47% |
| Fats | 70g | 630 kcal | 24% |

### Rest Day (1 day/week, default Sunday) — Target: 2,280 kcal
| Macro | Grams |
|---|---|
| Protein | 194g (same) |
| Carbs | 265g (reduced) |
| Fats | 58g (reduced) |

### Training Day Meals:
1. **Meal 1 — Morning Fuel** (8:00-8:30 AM, 5-7 min prep): 818 kcal, P:74g C:90g F:28g
   - 4 Egg Whites + 2 Whole Eggs, Atom Whey Shake, 80g Rolled Oats in 200ml milk, 1 Banana, 5g ON Creatine
2. **Meal 2 — Lunch Power** (1:00-2:00 PM, 10-15 min): 828 kcal, P:43g C:95g F:28g
   - 3 Rotis, 120g Paneer, Dal/Rajma/Chana, 100g Curd
3. **Meal 3 — Pre-Workout** (4:30-5:00 PM, 0 min): 368 kcal, P:10g C:55g F:16g
   - 2 Bananas, 2 tbsp Peanut Butter
4. **Meal 4 — Post-Workout** (8:30-9:30 PM, 5-7 min): 632 kcal, P:67g C:65g F:22g
   - 4 Egg Whites + 2 Whole Eggs, Atom Whey Shake, 2 Rotis, Dal/Sabzi

### Rest Day Changes:
- Meal 1: Same (no change)
- Meal 2: Reduce to 2 rotis (from 3)
- Meal 3: SKIP entirely (not training)
- Meal 4: Same (keep protein identical)

---

## 7. DATA MODEL (localStorage)

Key: `justeatit_data`

```json
{
  "settings": {
    "theme": "dark",
    "restDay": 0,
    "notifications": true,
    "lastEggPrep": "2026-03-05",
    "lastDalPrep": "2026-03-02"
  },
  "days": {
    "2026-03-05": {
      "isTrainingDay": true,
      "meals": [true, false, false, false],
      "water": 5,
      "sleep": { "hours": 7.5 },
      "workout": { "type": "push", "duration": 90, "cals": 585 },
      "weight": null,
      "photo": "data:image/jpeg;base64,..."
    }
  },
  "streak": 5
}
```

Theme is also stored separately at key: `justeatit_theme`

---

## 8. FILE STRUCTURE

```
just-eat-it/
├── public/
│   └── logo.png                    ← App logo (Just Eat It)
├── src/
│   ├── main.jsx                    ← React entry point
│   ├── App.jsx                     ← Router + state management shell
│   ├── index.css                   ← Global design system (ALL CSS variables, glass effects, animations, utilities)
│   ├── data/
│   │   └── dietPlan.js             ← Hardcoded meal plan, macros, supplements, schedule, helper functions
│   ├── hooks/
│   │   ├── useAppData.js           ← localStorage CRUD hook + streak calculator
│   │   └── useTheme.js             ← Dark/light theme hook
│   ├── components/
│   │   ├── BottomNav.jsx + .css    ← 5-tab bottom navigation
│   │   ├── ProgressRing.jsx + .css ← Animated SVG progress ring
│   └── pages/
│       ├── Dashboard.jsx + .css    ← Home page (main tracking view)
│       ├── Calendar.jsx + .css     ← Monthly calendar history
│       ├── Progress.jsx + .css     ← Weigh-in + photos + weekly summary
│       ├── Workout.jsx + .css      ← Workout logger + history
│       └── Settings.jsx + .css     ← Theme, prep tracking, references, data mgmt
├── index.html                      ← HTML entry (Inter font, PWA meta tags)
├── package.json
└── vite.config.js
```

---

## 9. CSS ARCHITECTURE

All theming is done via CSS custom properties defined in `src/index.css`. Key tokens:

| Token | Dark Mode | Light Mode |
|---|---|---|
| `--bg-primary` | `#0A0A0A` | `#F2F2F7` |
| `--bg-secondary` | `#141414` | `#FFFFFF` |
| `--bg-glass` | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.72)` |
| `--text-primary` | `#F5F5F5` | `#1A1A1A` |
| `--accent` | `#FF6B00` | `#FF6B00` |
| `--accent-glow` | `0 0 20px rgba(255,107,0,0.25)` | `0 0 20px rgba(255,107,0,0.15)` |
| `--glass-border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |

Dark mode is set via `[data-theme="dark"]` on `<html>`. Default is dark mode.

Key CSS classes:
- `.glass-card` — Glassmorphism card with blur + border
- `.glass-card.glow` — Adds orange glow shadow
- `.btn-primary` — Orange gradient button with glow
- `.text-display`, `.text-title`, `.text-headline`, `.text-body`, `.text-caption`, `.text-micro` — Typography scale
- `.page` — Page container with safe-area padding and max-width
- `.animate-in`, `.animate-delay-1` through `.animate-delay-6` — Staggered entrance animations

---

## 10. KEY INTERACTIONS

1. **Checking a meal**: Tap the circle button → it turns green with bounce animation → macro rings animate to new values → calorie counter updates
2. **Adding water**: Tap the water stat card → increments by 1 → blue fill bar rises from bottom of card
3. **Logging sleep**: Type hours into the sleep card input
4. **Switching Training/Rest day**: Tap the toggle → meals list changes, targets update
5. **Expanding a meal**: Tap the meal card header → shows food items with individual macros
6. **Calendar day detail**: Tap a day → shows meal status, water, sleep for that day
7. **Logging weight**: Enter kg + tap "Log" → adds to bar chart
8. **Taking progress photo**: Tap camera button → opens device camera → photo compressed and stored
9. **Toggling theme**: Tap toggle switch in Settings → instant theme switch with smooth transition
10. **Exporting data**: Tap export → downloads JSON backup file

---

## 11. NON-NEGOTIABLE DESIGN RULES

1. Black + White + Orange only. No other accent colors.
2. Glassmorphism on all cards — blur + semi-transparent + border.
3. Inter font only. No system fonts or serif.
4. All numbers should be bold (weight 700-900).
5. Orange glow on important/active elements.
6. Smooth animations on every state change.
7. Mobile-first — must look perfect at 390px wide.
8. No horizontal scrolling ever.
9. Bottom navigation always visible with glass blur.
10. Deep black background in dark mode (`#0A0A0A`), not grey.

---

## 12. RUNNING THE APP

```bash
cd "c:\Users\vishw\.gemini\antigravity\scratch\diet plan\just-eat-it"
npm install
npm run dev
# Opens at http://localhost:5173/
# Use browser DevTools mobile mode (390×844) for best preview
```
