# Block Stack

Mobile-first falling-block puzzle game built with **Next.js 15 App Router**, **TypeScript**, and **React 19**.  
It is designed to play smoothly on iPhone Safari (portrait-first) and deploy directly to Vercel.

## Features

- 10x20 visible playfield with hidden spawn rows
- 7 tetrominoes (I, O, T, S, Z, J, L)
- 7-bag randomization
- SRS-style rotation + wall kicks (including I-piece kick table)
- Ghost piece
- Hold piece (once per active piece)
- Next queue (5 previews)
- Soft drop / hard drop
- Lock delay + lock reset cap
- Line clears (single/double/triple/quad)
- Combo + back-to-back
- Practical T-spin detection
- Level progression + gravity speed-up
- Pause, restart, and game-over handling
- High score persistence (`localStorage`)
- Sound toggle persistence (`localStorage`)
- Touch controls optimized for iPhone
- Keyboard controls for desktop
- PWA manifest + standalone-friendly metadata

## Tech Stack

- Next.js `15.5.15`
- React `19.2.5`
- TypeScript `6.0.2`

## Project Tree

```text
.
├── app
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── Board.tsx
│   ├── GameScreen.tsx
│   ├── HudPanel.tsx
│   ├── PiecePreview.tsx
│   └── TouchControls.tsx
├── hooks
│   └── useGame.ts
├── lib
│   ├── audio
│   │   └── sound.ts
│   ├── game
│   │   ├── constants.ts
│   │   ├── engine.ts
│   │   ├── random.ts
│   │   ├── rotation.ts
│   │   ├── scoring.ts
│   │   └── types.ts
│   └── storage
│       └── preferences.ts
├── public
│   ├── icons
│   │   ├── apple-touch-icon.svg
│   │   ├── icon-192.svg
│   │   └── icon-512.svg
│   └── site.webmanifest
├── .eslintrc.json
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## Controls

### Keyboard

- `←` or `A`: move left
- `→` or `D`: move right
- `↓` or `S`: soft drop (hold)
- `↑` or `X`: rotate clockwise
- `Z`: rotate counter-clockwise
- `Space`: hard drop
- `C` or `Shift`: hold
- `P` or `Escape`: pause

### Touch (iPhone-friendly)

- Left, Right
- Soft Drop, Hard Drop
- Rotate CW, Rotate CCW
- Hold, Pause
- Restart button always available
- Large tap targets and touch-action-safe interactions

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start dev server:

   ```bash
   npm run dev
   ```

3. Open:

   ```text
   http://localhost:3000
   ```

## Production Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

Then for production:

```bash
vercel --prod
```

### Option B: Git Integration

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Keep defaults:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output: Next.js default
4. Deploy.

No database, auth, or external APIs are required.

## Notes

- Sound defaults to **off** to avoid autoplay issues on mobile browsers.
- High score and sound preference are stored locally in browser storage.
- The UI intentionally avoids trademarked branding and copyrighted audio/visual assets.
