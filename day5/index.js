import { writeFileSync } from 'fs';

function part1(input) {
  const lines = parseInput(input);
  const orthoLines = lines.filter(line => line.p1.x === line.p2.x || line.p1.y === line.p2.y);

  // to be honest, I'm not happy about this solution
  // I tried to do it with finding overlaps between lines themselves but it didn't work
  // and I can't figure out what was wrong with it, so I'm dropping down to a less-optimized solution
  let grid = createGrid(orthoLines);
  grid = orthoLines.reduce((grid, line) => plotLineOnGrid(grid, line), grid);
  const overlaps = countOverlaps(grid);
  return overlaps;
}

function part2(input) {
  const lines = parseInput(input);
  let grid = createGrid(lines);
  grid = lines.reduce((grid, line) => plotLineOnGrid(grid, line), grid);
  const overlaps = countOverlaps(grid);
  return overlaps;
}

function parseInput(input) {
  const entries = input.trim().split('\n');
  const lines = entries.map(entry => {
    let [ p1, p2 ] = entry.split(' -> ').map(coords => {
      const [ x, y ] = coords.split(',').map(i => +i);
      return { x, y };
    });

    return { p1, p2 };
  });

  return lines;
}

function wellOrderEndpoints(p1, p2) {
  // order the points such that p1.x <= p2.x and p1.y <= p2.y
  if(p1.x > p2.x || (p1.x === p2.x && p1.y > p2.y)) {
    [p1, p2] = [p2, p1]; // I FINALLY USED A ONE-LINE SWAP!
  }

  return [ p1, p2 ];
}

function createGrid(lines) {
  const maxX = lines.reduce((max, line) => Math.max(max, line.p1.x, line.p2.x), -Infinity);
  const maxY = lines.reduce((max, line) => Math.max(max, line.p1.y, line.p2.y), -Infinity);

  // add 1 to account for the zero row
  const grid = Array(maxY + 1).fill(0).map(() => Array(maxX + 1).fill(0));
  return grid;
}

function plotLineOnGrid(grid, line) {
  const xDif = line.p2.x - line.p1.x;
  const yDif = line.p2.y - line.p1.y;

  const xDir = (xDif / Math.abs(xDif)) || 0;
  const yDir = (yDif / Math.abs(yDif)) || 0;
  const steps = Math.max(Math.abs(xDif), Math.abs(yDif));

  for(let step = 0; step <= steps; ++step) {
    grid[line.p1.y + (step * yDir)][line.p1.x + (step * xDir)] += 1;
  }

  return grid;
}

function countOverlaps(grid) {
  return grid.reduce((overlaps, row) => row.reduce((overlaps, cell) => (cell > 1 ? overlaps + 1 : overlaps), overlaps), 0);
}

function formatGrid(grid) {
  return grid.map(row => row.map(cell => cell > 0 ? cell : '.').join(' ')).join('\n');
}

export default [
  part1,
  part2
];
