function part1(input) {
  const lines = input.trim().split('\n');

  const POINTS = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137,
  };

  const score = lines.map(parseLine).filter(results => results.status === 'corrupt' )
    .reduce((total, results) => total + POINTS[results.actual], 0);

  return score;
}

function part2(input) {
  const lines = input.trim().split('\n');

  const POINTS = {
    ')': 1,
    ']': 2,
    '}': 3,
    '>': 4,
  };

  const scores = lines.map(parseLine).filter(results => results.status === 'incomplete')
    .map(results => calculateAutocompleteScore(POINTS, results.autocomplete))
    .sort((a, b) => a - b);

  return scores[Math.floor(scores.length / 2)];
}

function calculateAutocompleteScore(points, autocomplete) {
  const score = autocomplete.split('').reduce((total, char) => total * 5 + points[char], 0);
  return score;
}

function parseLine(line) {
  const PAIRS = { '(': ')', '[': ']', '{': '}', '<': '>' };
  const OPENERS = Object.keys(PAIRS);
  const CLOSERS = Object.values(PAIRS);
  const REVERSE_PAIRS = Object.fromEntries(OPENERS.map((opener, ix) => [CLOSERS[ix], opener]));

  const stack = [];
  for(let i = 0; i < line.length; ++i) {
    if(OPENERS.includes(line[i])) {
      stack.unshift(line[i]);
      continue;
    }

    if(CLOSERS.includes(line[i])) {
      if(line[i] === PAIRS[stack[0]]) {
        stack.shift();
      } else {
        return { status: 'corrupt', expected: PAIRS[stack[0]], actual: line[i], char: i };
      }
    }
  }

  if(stack.length === 0) {
    return { status: 'working' };
  }

  const autocomplete = [];
  while(stack.length > 0) {
    autocomplete.unshift(PAIRS[stack.shift()]);
  }
  return { status: 'incomplete', autocomplete: autocomplete.reverse().join('') };
}

export default [
  part1,
  part2
];
