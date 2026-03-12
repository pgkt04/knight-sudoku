// Verify all pre-built puzzles are solvable and have unique solutions.

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/game/puzzles/puzzle-data.json', 'utf8'));

// Inline solver logic
function getKnightMoves(row, col) {
  const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const moves = [];
  for (const [dr, dc] of offsets) {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 9 && c >= 0 && c < 9) moves.push([r, c]);
  }
  return moves;
}

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

function findEmpty(grid) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] === 0) return [r, c];
  return null;
}

function solve(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [row, col] = empty;
  for (let d = 1; d <= 9; d++) {
    if (isValidPlacement(grid, row, col, d)) {
      grid[row][col] = d;
      if (solve(grid)) return true;
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

// Verify each puzzle
let allGood = true;
for (const p of data) {
  // 1. Verify the solution is valid
  let solutionValid = true;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!isValidPlacement(p.solution, r, c, p.solution[r][c])) {
        console.log(`Puzzle #${p.id}: INVALID solution at (${r},${c}) value=${p.solution[r][c]}`);
        solutionValid = false;
        allGood = false;
      }
    }
  }
  if (solutionValid) {
    // 2. Verify the grid matches the solution (givens are correct)
    let givensMatch = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (p.grid[r][c] !== 0 && p.grid[r][c] !== p.solution[r][c]) {
          console.log(`Puzzle #${p.id}: grid (${r},${c})=${p.grid[r][c]} != solution ${p.solution[r][c]}`);
          givensMatch = false;
          allGood = false;
        }
      }
    }

    // 3. Verify unique solution
    const testGrid = p.grid.map(r => [...r]);
    const solCount = countSolutions(testGrid, 2);
    if (solCount !== 1) {
      console.log(`Puzzle #${p.id}: has ${solCount} solutions (expected 1)`);
      allGood = false;
    } else {
      console.log(`Puzzle #${p.id} (${p.stars}★, ${p.givens} givens): OK - valid, unique solution`);
    }
  }
}

if (allGood) {
  console.log('\nAll puzzles verified!');
} else {
  console.log('\nSOME PUZZLES HAVE ISSUES');
}
