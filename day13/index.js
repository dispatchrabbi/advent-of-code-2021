import chalk from "chalk";

function part1(input) {
  const { dots, folds } = parseInput(input);

  const output = fold(dots, folds[0]);

  return output.length;
}

function part2(input) {
  const { dots, folds } = parseInput(input);

  const output = folds.reduce(fold, dots);

  console.log(drawPaper(output), '\n');
  return 'above, in graphical form.';
}

// today's input is a doozy of a format
function parseInput(input) {
  const dots = [];
  const folds = [];

  const lines = input.trim().split('\n').forEach(line => {
    if(line.startsWith('fold along')) {
      // ex.: `fold along x=5`
      const [ axis, coordinate ] = line.substring('fold along '.length).split('=');
      folds.push({ axis, coordinate: +coordinate });
    } else if(line.length > 0) {
      // ex.: 14,9
      dots.push(str2point(line));
    }
  });

  return { dots, folds };
}

function fold(paper, { axis, coordinate }) {
  const foldedPaper = paper.map(dot => {
    if(dot[axis] < coordinate) {
      return dot;
    }

    const mirrorDot = Object.assign({}, dot);
    const offset = dot[axis] - coordinate;
    mirrorDot[axis] = coordinate - offset;
    return mirrorDot;
  });

  const uniqued = uniquifyPoints(foldedPaper);


  return uniqued;
}

function uniquifyPoints(points) {
  // fuck yeah (don't do this in real code kids - readability is important!)
  const pointSet = points.reduce((pointSet, point) => pointSet.add(point2str(point)), new Set());
  return [ ...pointSet.values() ].map(str2point);
}

function point2str({ x, y }) {
  return `${x},${y}`;
}

function str2point(str) {
  const [ x, y ] = str.split(',');
  return { x: +x, y: +y };
}

function drawPaper(paper, fold = { axis: null, coordinate: null }) {
  const DOT = chalk.blue('█');
  const CREASE = chalk.green(fold.axis === 'x' ? '│' : '─');
  const BLANK = chalk.gray('.');

  const { maxX, maxY } = paper.reduce(({maxX, maxY}, dot) => ({
    maxX: Math.max(maxX, dot.x),
    maxY: Math.max(maxY, dot.y)
  }), {maxX: -Infinity, maxY: -Infinity});

  const pointSet = paper.reduce((pointSet, point) => pointSet.add(point2str(point)), new Set());

  const rows = [];
  for(let y = 0; y <= maxY; ++y) {
    const cols = [];
    for(let x = 0; x <= maxX; ++x) {
      if(pointSet.has(point2str({ x, y }))) {
        cols.push(DOT);
      } else if(fold.axis === 'x' ? (x === fold.coordinate) : (y === fold.coordinate)) {
        cols.push(CREASE);
      } else {
        cols.push(BLANK);
      }
    }

    rows.push(cols.join(''));
  }

  return rows.join('\n');
}

export default [
  part1,
  part2
];
