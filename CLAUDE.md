# Knight Sudoku

A cross-platform Sudoku game with an anti-knight constraint. Runs on browser, iOS, and iPadOS.

## Rules

Standard 9x9 Sudoku rules, plus: cells separated by a chess knight's move (L-shape) cannot contain the same digit.

## Tech Stack

| Layer           | Choice                                         |
| --------------- | ---------------------------------------------- |
| Framework       | React 18 + TypeScript                          |
| Build tool      | Vite                                           |
| Styling         | CSS Modules                                    |
| State           | `useReducer` (handles undo/redo naturally)     |
| Persistence     | `localStorage` (web), AsyncStorage (RN)        |
| Native          | React Native + Expo (iOS/iPadOS) — Phase 3     |
| Testing         | Vitest (unit tests for game logic)             |
| Shared logic    | `src/game/` — pure TS, no React imports        |

## Project Structure

```
knight-sudoku/
├── src/
│   ├── game/                # Pure TypeScript — zero React dependency
│   │   ├── types.ts         # Board, Cell, Difficulty types
│   │   ├── knight.ts        # Knight-move neighbor calculation
│   │   ├── validator.ts     # Check row/col/box/knight constraints
│   │   ├── solver.ts        # Backtracking solver with knight constraint
│   │   ├── generator.ts     # Puzzle generation + difficulty rating
│   │   └── puzzles/         # Pre-built curated puzzle packs (JSON)
│   ├── components/
│   │   ├── Board.tsx         # 9x9 grid rendering
│   │   ├── Cell.tsx          # Individual cell (value, pencil marks, state)
│   │   ├── NumberPad.tsx     # Input buttons 1-9 + erase
│   │   ├── Controls.tsx      # Undo, redo, pencil mode toggle, erase
│   │   ├── Timer.tsx         # Game timer
│   │   ├── DifficultySelect.tsx
│   │   └── GameOverModal.tsx
│   ├── hooks/
│   │   ├── useGame.ts        # Core game reducer (undo/redo stack)
│   │   ├── useTimer.ts       # Timer logic
│   │   └── usePersistence.ts # Save/load from localStorage
│   ├── App.tsx
│   ├── main.tsx
│   └── styles/
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Implementation Phases

### Phase 1: Web MVP (validate concept)

Scaffold the app and build the core game engine + basic playable UI.

1. **Scaffold React + Vite app**
2. **Types** — `Board` (9x9 grid), `Cell` (value, pencil marks, given vs player-entered), `Difficulty` enum
3. **Knight-move calculation** — given a cell `(r, c)`, return all cells reachable by a knight's L-shaped move, filtered to stay within 9x9 bounds
4. **Validator** — check if placing digit `d` at `(r, c)` violates row, column, 3x3 box, and knight constraints
5. **Solver** — backtracking solver that respects all four constraints; needed for puzzle generation and unique solution verification
6. **Generator** — fill a complete valid board, remove cells while maintaining unique solution, rate difficulty
7. **Pre-built puzzles** — JSON files with curated puzzles per difficulty for instant play
8. **Board + Cell rendering** — CSS Grid, 9x9 grid, number input, basic highlighting
9. **Number input** — NumberPad component, keyboard support (1-9), tap on mobile
10. **Timer** — counts up, pauses when backgrounded
11. **Difficulty selector** — Easy, Medium, Hard, Expert
12. **Game flow** — difficulty selection → play → win detection → completion screen
13. **Persistence** — auto-save game state to `localStorage`
14. **Deploy to subdomain** — e.g. sudoku.wu.fyi

### Phase 2: Polish web

15. **Knight-move visualization** — highlight cells a knight's move from selected cell (key UX differentiator)
16. **Error highlighting** — highlight conflicts in real-time (row/col/box/knight)
17. **Pencil marks** — toggle pencil mode, display small candidate numbers in cells
18. **Undo/Redo** — `useReducer` with action history stack
19. **Daily puzzle** — same puzzle for everyone each day (like NYT Games / LinkedIn)
20. **Share score / streak** — shareable result card, streak tracking
21. **Responsive layout** — phone (portrait), tablet (portrait + landscape), desktop
22. **Touch optimization** — large touch targets, tap cell → tap number
23. **Animations** — subtle cell fill animation, win celebration

### Phase 3: React Native + Expo (iOS/iPadOS)

24. **Scaffold Expo app** — separate project
25. **Import game-core** — same logic, zero changes
26. **Rebuild UI in RN** — `<View>`, `<Text>`, `<Pressable>` equivalents of web components
27. **Haptic feedback** — subtle haptics on input, error, win
28. **Smooth animations** — React Native Reanimated
29. **AdMob ads** — rewarded ads for hints, banner ads
30. **Safe areas** — iPhone notch/Dynamic Island, iPad multitasking
31. **App icon + splash screen**

### Phase 4: App Store Release

32. **EAS Build** — `eas build --platform ios` to generate .ipa
33. **TestFlight** — internal testing before submission
34. **App Store Connect listing** — name, description, screenshots (iPhone 6.7", 6.1", iPad 12.9"), keywords, category (Games > Puzzle)
35. **Privacy policy** — required by Apple, even for a simple game
36. **Age rating** — 4+ (no objectionable content)
37. **Pricing** — free with ads, IAP to remove ads
38. **Submit for App Review** — Apple reviews (usually 24-48 hours)
39. **Release**

## Key Design Decisions

### Undo/Redo
Game state reducer stores a history stack. Every move pushes the previous state onto the undo stack.

### Puzzle Generation Performance
Generating a knight-sudoku with a unique solution can be slow. Generate puzzles in a Web Worker so the UI doesn't freeze. Have pre-built puzzles available for instant play while a fresh one generates in the background.

### Knight-Move Visualization
Key differentiator from regular Sudoku apps. When a cell is selected, all knight-reachable cells should be subtly highlighted so the player can see the constraint visually.

### Difficulty Levels
Four levels: Easy, Medium, Hard, Expert. Difficulty is controlled by number of givens and complexity of required solving techniques.

### Daily Puzzle
Same puzzle for all players each day, seeded by date. Encourages daily engagement and social sharing.

### Monetization
- **Web**: free, no ads
- **iOS/iPadOS**: free with ads (AdMob), IAP to remove ads
- Rewarded ads for hints (watch ad → get a hint)

## Development Workflow

```
90% of dev time:  vite dev → browser → iterate fast
10% of dev time:  expo/eas → test on device → ship
```

Build and test everything in the browser first. Add React Native and iOS support after the web version is polished.
