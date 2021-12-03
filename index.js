import { dirname, join } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';

import chalk from 'chalk';

// I'm not proud of this, but eh, I can fix it later
const CONFIG = {
  cwd: dirname(import.meta.url).replace('file://', ''),
  expected: [],
};

main().catch(err => console.error(err));

async function main() {
  // determine which day to run
  const args = process.argv.slice(2);
  const dayNumber = +args[0];
  if(Number.isNaN(dayNumber)) {
    console.error(chalk.red('❗️ No day provided! Please provide a day number on the command line.'));
    process.exit(1);
  }

  // check if code for that day exists yet
  if(!existsSync(join(CONFIG.cwd, `day${dayNumber}`, 'index.js'))) {
    console.error(chalk.red(`❗️ Could not find day${dayNumber}/index.js. Quitting...`));
    process.exit(2);
  }

  // load expected results
  try {
    const expectedJsonContents = readFileSync(join(CONFIG.cwd, "expected.json"), 'utf8');
    CONFIG.expected = JSON.parse(expectedJsonContents);
  } catch(ex) {
    console.error(chalk.red('❗️ Could not read expected.json: ') + `${ex.message}`);
    process.exit(3);
  }

  console.log(`🌅 Day ${dayNumber}:`);
  console.group();
  await runDay(dayNumber);
  console.groupEnd();
}

async function runDay(dayNumber) {
  // import the functions for the day
  let { default: parts } = await import(join(CONFIG.cwd, `day${dayNumber}`, "index.js"));

  // figure out which tests to run
  const inputTypes = getInputTypes(dayNumber);

  // run each part and report back
  parts.forEach(function(partFn, ix) {
    const partNumber = ix + 1;

    console.log(`${partNumber}\ufe0f\u20e3  Part ${partNumber}:`);
    console.group();
    if(inputTypes.examples) {
      runPartExamples(dayNumber, partNumber, partFn);
    }
    if(inputTypes.input) {
      let input = readFileSync(join(CONFIG.cwd, `day${dayNumber}`, 'input.txt'), 'utf8');
      runPartForReal(partFn, input);
    }
    console.groupEnd();
  });
}

function getInputTypes(dayNumber) {
  const textFilesInDayDir = readdirSync(join(CONFIG.cwd, `day${dayNumber}`), 'utf8').filter(filename => filename.endsWith('.txt'));
  return {
    examples: textFilesInDayDir.filter(filename => filename !== 'input.txt').length > 0,
    input: textFilesInDayDir.includes('input.txt'),
  };
}

function runPartExamples(dayNumber, partNumber, partFn) {
  // get test results we're looking to see
  const expectedResults = getExpectedResults(dayNumber, partNumber);
  expectedResults.forEach(async function(example) {
    // read the input for the example and run the code
    let input;
    try {
      input = readFileSync(join(CONFIG.cwd, `day${dayNumber}`, example.input), 'utf8');
    } catch(ex) {
      console.warn(chalk.yellow(`🔇 Could not read input at ${example.input}. Skipping...`));
      return;
    }
    const output = partFn(input);

    if(output === example.expected) {
      console.log(chalk.greenBright(`✅ The example at ${example.input} passed!`));
    } else {
      console.log(chalk.redBright(`❌ Expected ${output} to equal ${example.expected} but it did not :(`));
    }
  });
}

function runPartForReal(partFn, input) {
  let output = partFn(input)
  console.log(chalk.blue('🏁 The output for real is: ') + chalk.bold(`${output}`));
}

function getExpectedResults(dayNumber, partNumber) {
  return CONFIG.expected.filter(entry => entry.day === dayNumber && entry.part === partNumber);
}
