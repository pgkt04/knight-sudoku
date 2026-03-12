// Script to generate pre-built knight-sudoku puzzles.
// Run with: npx tsx scripts/generate-puzzles.ts

// Inline the logic to avoid module resolution issues with ts paths

// ── Knight moves ──
function getKnightMoves(row, col) {
  const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const moves = [];
  for (const [dr, dc] of offsets) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 9 && c >= 0 && c < 9) moves.push([r, c]);
  }
  return moves;
}

// ── Validator ──
function isValidPlacement(grid, row, col, digit) {
  for (let c = 0; c < 9; c++) if (c !== col && grid[row][c] === digit) return false;
  for (let r = 0; r < 9; r++) if (r !== row && grid[r][col] === digit) return false;
  const br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
  for (let r = br; r < br+3; r++)
    for (let c = bc; c < bc+3; c++)
      if ((r !== row || c !== col) && grid[r][c] === digit) return false;
  for (const [kr, kc] of getKnightMoves(row, col))
    if (grid[kr][kc] === digit) return false;
  return true;
}

// ── Solver ──
function findEmpty(grid) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] === 0) return [r, c];
  return null;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function solveRandom(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [row, col] = empty;
  for (const d of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (isValidPlacement(grid, row, col, d)) {
      grid[row][col] = d;
      if (solveRandom(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  function search() {
    const empty = findEmpty(grid);
    if (!empty) { count++; return count >= limit; }
    const [row, col] = empty;
    for (let d = 1; d <= 9; d++) {
      if (isValidPlacement(grid, row, col, d)) {
        grid[row][col] = d;
        if (search()) { grid[row][col] = 0; return true; }
        grid[row][col] = 0;
      }
    }
    return false;
  }
  search();
  return count;
}

// ── Generator ──
function generatePuzzle(targetGivens) {
  const solution = Array.from({length:9}, () => Array(9).fill(0));
  solveRandom(solution);

  const puzzle = solution.map(r => [...r]);
  const cells = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      cells.push([r, c]);
  
  // Shuffle removal order
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  let givens = 81;
  for (const [r, c] of cells) {
    if (givens <= targetGivens) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const test = puzzle.map(r => [...r]);
    if (countSolutions(test, 2) !== 1) {
      puzzle[r][c] = backup;
    } else {
      givens--;
    }
  }

  return { grid: puzzle, solution, givens };
}

// ── Generate puzzles at different difficulty levels ──
// Stars 1-2: 40-45 givens (very easy)
// Stars 3-4: 35-39 givens (easy)
// Stars 5-6: 30-34 givens (medium)
// Stars 7-8: 26-29 givens (hard)
// Stars 9-10: 20-25 givens (expert)

const STAR_GIVENS = {
  1: 45, 2: 42,
  3: 39, 4: 37,
  5: 34, 6: 32,
  7: 29, 8: 27,
  9: 25, 10: 22,
};

// Generate 3 puzzles per star level = 30 puzzles
const allPuzzles = [];
let id = 1;

for (let stars = 1; stars <= 10; stars++) {
  const target = STAR_GIVENS[stars];
  for (let i = 0; i < 3; i++) {
    console.error(`Generating puzzle #${id} (${stars} stars, ~${target} givens)...`);
    const { grid, solution, givens } = generatePuzzle(target);
    allPuzzles.push({ id, stars, givens, grid, solution });
    id++;
  }
}

// Compact JSON: grids as single-line arrays
const output = "[\n" + allPuzzles.map(p => {
  const gridStr = "[" + p.grid.map(r => JSON.stringify(r)).join(",") + "]";
  const solStr = "[" + p.solution.map(r => JSON.stringify(r)).join(",") + "]";
  return `  {"id":${p.id},"stars":${p.stars},"givens":${p.givens},"grid":${gridStr},"solution":${solStr}}`;
}).join(",\n") + "\n]";
console.log(output);
