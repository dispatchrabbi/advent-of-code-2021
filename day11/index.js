import chalk from "chalk";

function part1(input) {
  const octopi = parseInput(input);

  let totalFlashes = 0;
  const STEPS = 100;
  for(let currentStep = 1; currentStep <= STEPS; ++currentStep) {
    const flashes = step(octopi);
    totalFlashes += flashes;
  }
  return totalFlashes;
}

function part2(input) {
  const octopi = parseInput(input);

  // we're looking for a step when all the octopi flash, one flash per octopus
  const TARGET_FLASHES = octopi.length * octopi[0].length;
  let steps;
  for(steps = 1; step(octopi) !== TARGET_FLASHES; ++steps) { }
  return steps;
}

function printOctopi(octopi, title = null) {
  if(title) {
    console.log(chalk.magenta(title));
  }
  const field = octopi.map(row => row.map(renderOctopus).join('')).join('\n');
  console.log(field);
  console.log('\n');
}

function renderOctopus(octopus) {
  const char = octopus.brightness.toString(24);
  if(octopus.flashed) {
    return chalk.yellow(char);
  } else if(octopus.brightness > 9) {
    return chalk.red(char);
  } else {
    return char;
  }
}

function parseInput(input) {
  const lines = input.trim().split('\n');
  const octopi = lines.map(line => line.split('').map(brightness => ({ brightness: +brightness, flashed: false })));

  return octopi;
}

function step(octopi) {
  // increase each octopus's brightness by 1
  let newFlashers = [];
  for(let row = 0; row < octopi.length; ++row) {
    for(let col = 0; col < octopi[row].length; ++col) {
      const octopus = octopi[row][col];
      octopus.brightness += 1;

      if(octopus.brightness > 9) {
        newFlashers.push({ row, col });
      }
    }
  }

  // flash the octopi!
  newFlashers.forEach(({row, col}) => {
    if(octopi[row][col].flashed === false) {
      flashOctopus(octopi, row, col);
    }
  });

  // reset the octopi
  let numberFlashed = 0;
  octopi.forEach(row => row.forEach(octopus => {
    if(octopus.flashed) {
      numberFlashed++;
      octopus.flashed = false;
    }
    octopus.brightness = octopus.brightness > 9 ? 0 : octopus.brightness;
  }));

  return numberFlashed;
}

function flashOctopus(octopi, row, col) {
  octopi[row][col].flashed = true;

  // an octopus that has flashed will increase the brightness of all adjacent octopi, including diagonals
  const LAST_ROW = octopi.length - 1;
  const LAST_COL = octopi[0].length - 1;
  for(let rowOffset = -1; rowOffset <= 1; ++rowOffset) {
    for(let colOffset = -1; colOffset <= 1; ++colOffset) {
      let adjacentRow = row + rowOffset;
      let adjacentCol = col + colOffset;
      if(adjacentRow >= 0 && adjacentRow <= LAST_ROW && adjacentCol >= 0 && adjacentCol <= LAST_COL) {
        const adjacentOctopus = octopi[adjacentRow][adjacentCol];
        adjacentOctopus.brightness = Math.min(10, adjacentOctopus.brightness + 1);
        // if the adjacent octopus is now bright enough to flash, it does (but only if it hasn't already)
        if(adjacentOctopus.brightness > 9 && adjacentOctopus.flashed === false) {
          flashOctopus(octopi, adjacentRow, adjacentCol);
        }
      }
    }
  }
}

export default [
  part1,
  part2
];
