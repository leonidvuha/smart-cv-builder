# SmartCV Builder

AI-powered resume builder that creates bilingual resumes (DE + EN) through a guided chat conversation.

Built as a portfolio project demonstrating full-stack development with Next.js, OpenAI integration, and server-side PDF generation.

## How It Works

1. **Sign in** with Google OAuth
2. **Chat with AI** — the assistant asks guided questions about your experience, education, and skills
3. **Fill in details** — add your name, phone, and photo via the side panel
4. **One click** — AI generates a structured bilingual resume (German Lebenslauf + English CV) in a single API call
5. **Download PDFs** — instantly, with no additional AI calls

## Key Features

- **Bilingual output** — one OpenAI call produces both DE and EN versions, stored as JSON in the database
- **Instant PDF generation** — `@react-pdf/renderer` builds PDFs from stored data with zero latency
- **Streaming chat** — real-time AI responses via ReadableStream
- **Full i18n** — UI available in Deutsch, English, and Ukrainian (next-intl)
- **Locale-aware AI** — the chat assistant responds in the user's selected interface language
- **Mobile responsive** — collapsible form panel, sticky action buttons, adaptive layout
- **Photo support** — uploaded photos are base64-encoded and embedded directly in PDFs

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon) + Prisma 7 |
| Auth | NextAuth v5 (Google OAuth) |
| AI | OpenAI GPT-4o-mini |
| PDF | @react-pdf/renderer |
| Styling | Tailwind CSS v4 + shadcn/ui |
| i18n | next-intl |

## Architecture

```
Chat (streaming)          Form (name, phone, photo)
       \                        /
        \                      /
     POST /api/resume/create
              |
     OpenAI (single call)
     → { en: ResumeData, de: ResumeData }
              |
     Stored in DB as localizedContent (JSON)
              |
     GET /api/resume/[id]/pdf?locale=en|de
     → @react-pdf/renderer → PDF buffer (no AI calls)
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx          # Landing page
│   │   ├── chat/page.tsx     # AI chat + form (responsive)
│   │   ├── dashboard/page.tsx# Resume list + downloads
│   │   └── auth/signin/      # Sign-in page
│   └── api/
│       ├── chat/             # Streaming chat + session
│       └── resume/           # Create + PDF + delete
├── components/
│   ├── pdf/ClassicTemplate.tsx  # PDF layout component
│   ├── Navbar.tsx               # Nav with locale switcher
│   └── ResumeCard.tsx           # Status-aware resume card
├── types/resume.ts           # Shared types (ResumeData, LocalizedContent)
└── i18n/                     # Routing + locale config
messages/
├── de.json                   # German translations
├── en.json                   # English translations
└── ua.json                   # Ukrainian translations
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
DATABASE_URL=           # PostgreSQL connection string (Neon)
NEXTAUTH_SECRET=        # Random secret for NextAuth
NEXTAUTH_URL=           # http://localhost:3000 for dev
OPENAI_API_KEY=         # OpenAI API key
GOOGLE_CLIENT_ID=       # Google OAuth client ID
GOOGLE_CLIENT_SECRET=   # Google OAuth client secret
```

## License

MIT
