# kin-ky

A blind dating platform built exclusively for UBC students. Every week, users are matched with someone new based on questionnaire compatibility -no swiping, no browsing profiles.

**Live at [kin-ky.com](https://www.kin-ky.com)**

## How It Works

1. Sign up with a verified `@student.ubc.ca` email
2. Complete your profile and answer 10 compatibility questions
3. Get matched weekly with a compatible student
4. Progress through a 2-tier reveal system:
   - **Preview** - See your match's name, year, faculty, and icebreaker answers
   - **Reveal** - Both say "I'm down" to unlock photos and Instagram

## Features

- **Compatibility-based matching** -Pairs users using Jaccard similarity and scale proximity scoring across questionnaire answers
- **Gender & match preference filtering** -Users specify their gender and who they want to be matched with
- **Progressive reveal** - A 2-tier system that unlocks photos and Instagram when both users express interest
- **Email notifications** - Users get notified when they're matched and when mutual interest is confirmed
- **Weekly match rounds** -Fresh matches every week with no rematching of past pairs
- **Admin dashboard** -Manage rounds, schedule dates, run the matching algorithm, and view match statistics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
