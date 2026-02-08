# PixelDrop 🎯

A content pipeline and auto-scheduler for design assets. Upload images, add captions, and automatically post them to Telegram daily.

## Features

- 📤 **Drag & Drop Upload** — Images go to Cloudinary, metadata to Postgres
- ✏️ **Caption Management** — Add and edit captions per asset
- 🤖 **Telegram Integration** — Auto-post to your Telegram channel
- ⏰ **Daily Scheduling** — Configurable post time (default: 09:00 UTC)
- 📊 **Pipeline Dashboard** — Track available, scheduled, and posted assets
- 🔧 **Manual Posting** — Post immediately with one click

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL + Prisma ORM
- **Media:** Cloudinary
- **Deployment:** Netlify

## Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Database (provided)
DATABASE_URL="postgres://..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="749686221242924"
CLOUDINARY_API_SECRET="TvTI83dgJm-QqijtQSrIY3Yvoe8"

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456789:ABC..."
TELEGRAM_CHANNEL_ID="@yourchannel" or "-1001234567890"

# Schedule
POST_TIME="09:00"  # 24h UTC format

# Optional: Protect scheduler endpoint
CRON_SECRET="random-secret-string"
```

### 2. Telegram Bot Setup

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot (`/newbot`)
3. Copy the bot token
4. Add the bot to your channel as an admin
5. Get your channel ID (use [@userinfobot](https://t.me/userinfobot) or just use `@channelname`)

### 3. Database

```bash
npx prisma db push
```

### 4. Development

```bash
npm run dev
```

### 5. Daily Scheduler

To enable automatic daily posting, set up a cron job to hit:

```
POST https://your-domain.com/api/scheduler/post
Authorization: Bearer YOUR_CRON_SECRET
```

**Using GitHub Actions** (free):

Create `.github/workflows/scheduler.yml`:

```yaml
name: Daily PixelDrop Post
on:
  schedule:
    - cron: '0 9 * * *'  # 9:00 AM UTC daily
  workflow_dispatch:

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://your-domain.com/api/scheduler/post \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Using Netlify Scheduled Functions** (paid):

Add to `netlify.toml`:

```toml
[functions]
  schedule = "@daily"
```

**Using cron-job.org** (free):

1. Go to [cron-job.org](https://cron-job.org)
2. Create a new job
3. URL: `https://your-domain.com/api/scheduler/post`
4. Method: POST
5. Header: `Authorization: Bearer your-cron-secret`

## Usage

1. **Upload** — Drag images or click to upload
2. **Caption** — Click the edit icon on any asset to add a caption
3. **Configure** — Go to Settings, add your Telegram bot token and channel
4. **Test** — Hit "Test Post" to verify Telegram connection
5. **Schedule** — Set up the daily cron job (or post manually)

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assets/        # CRUD for assets
│   │   │   ├── config/        # Settings storage
│   │   │   ├── scheduler/     # Posting logic
│   │   │   └── upload/        # Cloudinary upload
│   │   ├── page.tsx           # Main dashboard
│   │   └── settings/          # Configuration page
│   ├── components/
│   │   └── Uploader.tsx       # Upload component
│   └── lib/
│       ├── prisma.ts          # Database client
│       └── telegram.ts        # Telegram API
├── prisma/
│   └── schema.prisma          # Database schema
```

## Schema

```prisma
model Asset {
  id           String   @id @default(cuid())
  url          String
  publicId     String   @unique
  format       String
  width        Int
  height       Int
  caption      String?
  status       String   @default("available") // available, scheduled, posted
  createdAt    DateTime @default(now())
  postedAt     DateTime?
}

model Config {
  id                String   @id @default(cuid())
  telegramBotToken  String?
  telegramChannelId String?
  postTime          String   @default("09:00")
  updatedAt         DateTime @updatedAt
}
```

## Roadmap

- [ ] Bulk upload
- [ ] Queue reordering (drag & drop)
- [ ] Post history/analytics
- [ ] Multi-platform (Twitter/X, LinkedIn, Instagram when APIs allow)
- [ ] Schedule individual posts (not just daily)

## License

MIT
