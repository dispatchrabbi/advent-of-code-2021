// Well, I learned nothing from the lanternfish
// As usual, part 1 is here for posterity; part 2 will use the optimized solution

function part1(input) {
  let { polymer, rules } = parseInput(input);

  const STEPS = 10;
  for(let stepNumber = 0; stepNumber < STEPS; ++stepNumber) {
    polymer = step(polymer, rules);
  }

  const counts = countElements(polymer);

  return Math.max(...Object.values(counts)) - Math.min(...Object.values(counts));
}

function part2(input) {
  let { polymer, rules } = parseInput(input);

  const STEPS = 40;
  const elementCounts = lengthenPolymer(polymer, rules, STEPS);

  return Math.max(...elementCounts.values()) - Math.min(...elementCounts.values());
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const polymer = lines[0];

  const rules = new Map();
  for(let line of lines.slice(2)) {
    const [ pair, infix ] = line.split(' -> ');
    rules.set(pair, infix);
  }

  return { polymer, rules };
}

function step(polymer, rules) {
  let lengthenedPolymer = polymer[0];
  // we're going to consider pairs of letters that start at (ix - 1)
  for(let ix = 1; ix < polymer.length; ++ix) {
    // if there is a rule, add the appropriate infix
    lengthenedPolymer += rules.get(polymer.substr(ix - 1, 2)) || '';
    lengthenedPolymer += polymer[ix];
  }

  return lengthenedPolymer;
}

function lengthenPolymer(polymer, rules, steps) {
  let pairCounts = new Map();
  let elementCounts = new Map();

  elementCounts.set(polymer[0], 1);
  for(let i = 1; i < polymer.length; ++i) {
    const element = polymer[i];
    elementCounts.set(element, (elementCounts.get(element) || 0) + 1);

    const pair = polymer.substr(i - 1, 2);
    pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
  }

  for(let stepNumber = 0; stepNumber < steps; ++stepNumber) {
    const results = _iteratePairs(pairCounts, elementCounts, rules);
    pairCounts = results.pairCounts;
    elementCounts = results.elementCounts;
  }

  return elementCounts;
}

function _iteratePairs(pairCounts, elementCounts, rules) {
  const iteratedPairCounts = new Map();
  for(let pair of pairCounts.keys()) {
    const numberOfPairs = pairCounts.get(pair);
    const infix = rules.get(pair);

    if(infix) {
      iteratedPairCounts.set(pair[0] + infix, (iteratedPairCounts.get(pair[0] + infix) || 0) + numberOfPairs);
      iteratedPairCounts.set(infix + pair[1], (iteratedPairCounts.get(infix + pair[1]) || 0) + numberOfPairs);
      elementCounts.set(infix, (elementCounts.get(infix) || 0) + numberOfPairs);
    } else {
      iteratedPairCounts.set(pair, numberOfPairs);
    }
  }

  return { pairCounts: iteratedPairCounts, elementCounts };
}

function countElements(polymer) {
  return polymer.split('').reduce((counts, letter) => { counts[letter] = (counts[letter] || 0) + 1; return counts; }, {});
}

export default [
  part1,
  part2
];
