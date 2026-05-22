# Tally

Track events, not streaks. A minimalist habit tracker built to help you monitor patterns without the pressure of maintaining gamified streaks.

## Screenshots

<div align="center">
  <img src="./screenshots/main-screen.png" alt="Dashboard" width="300" />
  <img src="./screenshots/add-event.png" alt="Themes" width="300" />
  <img src="./screenshots/manage-events.png" alt="Settings" width="300" />
  <img src="./screenshots/month-view.png" alt="Chart" width="300" />
  <img src="./screenshots/theme-switch.png" alt="Add Event" width="300" />
</div>

## Features

- Event Tracking: Log specific events with custom types and colors. Define what matters to you, whether it's a relapse, a workout, or a simple check-in.

- Visual Analytics: View your data through interactive charts that break down trends by day, week, month, or year.

- Health Score: A unified score (0-100) calculated from your daily rate. It focuses on your current velocity rather than long-term averages.

- Custom Themes: 5 pastel themes (Sage Mist, Sky Wash, Lavender Haze, Blush Pink, Warm Sand) built using CSS variables and next-themes for instant switching.

- Local Storage: Your data stays in your browser. No account or sign-up required.

- PWA Support: Install it on your phone for a native app experience.

## Tech Stack

- React 19 & TypeScript
- Vite
- Zustand (with persistence)
- Tailwind CSS V4
- shadcn/ui
- next-themes

## Logic & Calculations

### Health Score

The score is a smooth decay curve calculated from a weighted daily rate across all tracked periods:

```
score = 100 / (1 + 50 × averageDailyRate)
```

Week and Month are weighted ×2 versus Year, since recent behavior is more relevant. The "Today" period is excluded from the score — a single day is too noisy to be meaningful.

| Daily Rate | Score | Label     |
|------------|-------|-----------|
| 0.00       | 100   | Excellent |
| 0.02       | 91    | Excellent |
| 0.10       | 67    | Good      |
| 0.50       | 29    | Fair      |
| 1.00       | 17    | Poor      |

Score thresholds: ≥90 Excellent, ≥70 Good, ≥40 Fair, <40 Poor.

### Rates

Rates use fixed full-period divisors regardless of how much of the period has elapsed. This reflects your projected pace if the current count continued at the same frequency.

| Period | Divisors used         |
|--------|-----------------------|
| Week   | Days elapsed (Sat–Fri, week starts Saturday) |
| Month  | ÷30 (day), ÷4 (week)  |
| Year   | ÷365 (day), ÷52 (week), ÷12 (month) |

The week rate is the only one using elapsed time, since projecting a full 7-day week from day 1 would be misleading.

## Contributing

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/tally.git
   cd tally
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Start the development server

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view the app.

### Themes

Themes are defined via CSS classes in `globals.css`. To add a new theme, define a new class (e.g., `.theme-midnight`) with the necessary CSS variables (`--background`, `--foreground`, etc.) and add it to the `THEMES` array in `configs.ts`.
