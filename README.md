# Smart CV Builder

AI-powered resume builder for the German job market.

## What it does

1. User registers (email or Google OAuth)
2. Chooses one of 3 resume templates
3. Chats with AI — AI asks guided questions
4. AI fills the template based on answers
5. AI suggests skills based on work experience
6. Output:
   - 🇩🇪 **Lebenslauf** — German resume format
   - 🇬🇧 **CV** — International format in English

## Interface Languages

- 🇩🇪 Deutsch
- 🇬🇧 English
- 🇺🇦 Українська

> AI understands any language — users can write in whatever language they prefer.

## Tech Stack

| Technology | Version |
|---|---|
| Next.js | 16.2 |
| React | 19.2 |
| TypeScript | 5.x |
| Prisma ORM | 7.x |
| PostgreSQL | latest (Neon.tech) |
| NextAuth.js | v5 |
| Tailwind CSS | v4 |
| next-intl | latest |
| OpenAI SDK | latest |
| @react-pdf/renderer | latest |

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Status

🚧 In active development
