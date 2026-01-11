# Al-Quran App 📖

A modern, beautiful Quran application built with Next.js 15, featuring AI-powered chat, surah browsing, and verse search capabilities.

## Features

- 🕌 **Browse All 114 Surahs** - Complete Quran with Arabic text and English translations
- 🔍 **Search Verses** - Find specific verses across the entire Quran
- 💬 **AI Chat** - Ask questions about the Quran and Islamic teachings
- 🎨 **Modern UI** - Clean, responsive design with dark mode support
- ⚡ **Fast Performance** - Built with Next.js App Router for optimal loading

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Runtime:** Bun
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Package manager (bun recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bwirakes/al-quaran-test.git
cd al-quaran-test
```

2. Install dependencies:
```bash
bun install
```

3. Run the development server:
```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/chat/      # AI chat API route
│   ├── chat/          # Chat page
│   ├── quran/         # Quran browsing pages
│   │   ├── [surah]/   # Individual surah view
│   │   └── search/    # Search page
│   └── page.tsx       # Home page
├── components/
│   ├── chat/          # Chat components
│   ├── quran/         # Quran-specific components
│   └── ui/            # Reusable UI components
└── lib/
    ├── quran-data.ts  # Quran data fetching
    └── utils.ts       # Utility functions
```

## License

MIT
