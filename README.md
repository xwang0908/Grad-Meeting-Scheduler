# Graduate Meeting Scheduler

A frontend prototype for a graduate student meeting scheduling and conflict negotiation tool.

This project helps graduate project teams compare meeting time options when there is no perfect overlap. It focuses on transparent recommendations, fairness-aware scheduling, and editable user preferences.

## Features

- Availability overview grid
- Top ranked meeting time options
- "Why this time?" explanation panel
- Preference and override editor
- Conflict banner / renegotiation state
- Mock scheduling logic using local JSON data

## Tech Stack

- React
- Vite
- Tailwind CSS

## Project Structure

```bash
src/
  components/
    Header.jsx
    AvailabilityGrid.jsx
    CandidateCard.jsx
    ExplanationPanel.jsx
    PreferenceDrawer.jsx
    ConflictBanner.jsx
  data/
    members.json
    availability.json
  pages/
    SchedulerPage.jsx
  utils/
    explanation.js
    scheduler.js
    scoring.js
  App.jsx
  main.jsx
  index.css
```

## Terminal
To run: npm run dev
