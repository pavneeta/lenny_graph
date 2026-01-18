# Lenny's Podcast Graph - Next.js Version

This is the Next.js/React rewrite of the 3D relational graph visualization.

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **Tailwind CSS** - Styling (via utility classes)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The project is configured for Vercel deployment. Simply push to GitHub and connect to Vercel, or use:

```bash
vercel
```

## Project Structure

```
nextjs-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page component
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Graph3D.tsx       # Three.js graph component
│   ├── FilterPanel.tsx   # Filter controls
│   └── NodeDetails.tsx   # Episode details panel
├── lib/                   # Utility functions
│   ├── dataLoader.ts     # Data loading logic
│   └── graphUtils.ts     # Graph creation and filtering
├── types/                 # TypeScript types
│   └── index.ts          # Type definitions
└── public/                # Static assets
    └── Final_lenny_extracted_cleaned.jsonl
```

## Features

- ✅ 3D interactive graph with Three.js
- ✅ Dimension-based filtering (Category, Functions, Primary Audience)
- ✅ Click nodes to view episode details
- ✅ Link to raw transcripts
- ✅ Force-directed layout algorithm
- ✅ Responsive design
- ✅ TypeScript for type safety
- ✅ Component-based architecture

## Differences from Original

- **Framework**: Next.js/React instead of vanilla HTML/JS
- **Type Safety**: TypeScript throughout
- **Component Architecture**: Modular, reusable components
- **Build System**: Next.js build pipeline
- **Styling**: Tailwind CSS utility classes (can be switched to CSS modules)

