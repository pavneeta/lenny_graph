# Migration Guide: Vanilla HTML to Next.js

This document explains the migration from the vanilla HTML/JavaScript version to the Next.js/React version.

## Key Changes

### Architecture

**Before (Vanilla):**
- Single HTML file with inline JavaScript
- Global variables and functions
- Manual DOM manipulation
- No build process

**After (Next.js):**
- Component-based React architecture
- TypeScript for type safety
- Modular code organization
- Next.js build pipeline

### File Structure

**Before:**
```
graph_visualization_v2.html (1078 lines)
```

**After:**
```
nextjs-app/
├── app/
│   ├── page.tsx          # Main page (100 lines)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── Graph3D.tsx        # 3D visualization (300 lines)
│   ├── FilterPanel.tsx    # Filter UI (100 lines)
│   └── NodeDetails.tsx    # Details panel (100 lines)
├── lib/
│   ├── dataLoader.ts      # Data loading (80 lines)
│   └── graphUtils.ts       # Graph logic (100 lines)
└── types/
    └── index.ts           # TypeScript types
```

### Benefits

1. **Type Safety**: TypeScript catches errors at compile time
2. **Maintainability**: Modular components are easier to update
3. **Reusability**: Components can be reused or extended
4. **Developer Experience**: Better tooling, hot reload, debugging
5. **Performance**: Next.js optimizations (code splitting, etc.)
6. **Scalability**: Easier to add features (search, analytics, etc.)

### Migration Steps

1. **Install dependencies:**
   ```bash
   cd nextjs-app
   npm install
   ```

2. **Copy data files:**
   - `Final_lenny_extracted_cleaned.jsonl` → `public/`
   - `transcripts/` folder → `public/transcripts/`

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy to Vercel:**
   - Push to GitHub
   - Connect to Vercel (auto-detects Next.js)
   - Deploy!

## Feature Parity

✅ All features from the original are preserved:
- 3D interactive graph
- Dimension-based filtering
- Node click details
- Transcript links
- Force-directed layout
- Responsive design

## Next Steps

Potential enhancements now that we have a framework:
- Add search functionality
- Add URL parameters for sharing filtered views
- Add analytics
- Add loading states
- Add error boundaries
- Add unit tests
- Add storybook for components

