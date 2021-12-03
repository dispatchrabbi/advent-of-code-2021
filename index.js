import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// I'm not proud of this, but eh, I can fix it later
const CONFIG = {
  cwd: null,
  dayFolder: null,
}

async function runDay(dayConfig) {
  CONFIG.dayFolder = `day${dayConfig.number}`;

  let { default: parts } = await import(join(CONFIG.cwd, CONFIG.dayFolder, "index.js"));

  dayConfig.parts.forEach(function(partConfig, ix) {
    console.log(`💬 Part ${ix + 1}:`);

    console.group();
    let partFn = parts[ix];
    if(!partFn) {
      console.log(`🌋 No part function found! Skipping...`);
      return;
    }

    runPart(partFn, partConfig);
    console.groupEnd();
  });
}

function runPart(partFn, partConfig) {
  // do examples
  if(partConfig.examples) {
    partConfig.examples.forEach(async function(example) {
      let expected = example.expected;

      let input = readFileSync(join(CONFIG.cwd, CONFIG.dayFolder, example.input), 'utf8');
      let output = partFn(input);

      if(output === expected) {
        console.log(`✅ The example at ${example.input} passed!`);
      } else {
        console.log(`❌ Expected ${output} to equal ${expected} but it did not`);
      }
    });
  }

  // do real input (if it exists)
  if(partConfig.input) {
    let input = readFileSync(join(CONFIG.cwd, CONFIG.dayFolder, partConfig.input), 'utf8');
    let output = partFn(input)
    console.log(`🏁 The output for real is: ${output}`);
  }
}

async function main() {
  CONFIG.cwd = dirname(import.meta.url).replace('file://', '');

  const args = process.argv.slice(2);
  const day = +args[0];
  if(Number.isNaN(day)) {
    console.error('No day provided! Please provide a day number on the command line.');
    process.exit(1);
  }

  const daysJsonContents = readFileSync(join(CONFIG.cwd, "days.json"), 'utf8');
  const daysJson = JSON.parse(daysJsonContents);

  const dayJson = daysJson.filter(dayConfig => dayConfig.number === day);
  if(dayJson.length < 1) {
    console.warn(`No config found for day ${day}. Exiting...`);
    process.exit(0);
  } else if(dayJson.length > 1) {
    console.error(`More than one config found for day ${day}. You should... fix that.`);
    process.exit(2);
  }

  console.log(`🌅 Day ${day}:`);
  console.group();
  await runDay(daysJson[day]);
  console.groupEnd();
}

main().catch(err => console.error(err));
