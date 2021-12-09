function part1(input) {
  const lines = input.trim().split('\n').map(parseLine);

  const SEGMENTS_LIT = [
    /* 0 */ 'abcefg',
    /* 1 */ 'cf',
    /* 2 */ 'acdeg',
    /* 3 */ 'acdfg',
    /* 4 */ 'bcdf',
    /* 5 */ 'abdfg',
    /* 6 */ 'abdefg',
    /* 7 */ 'acf',
    /* 8 */ 'abcdefg',
    /* 9 */ 'abcdfg',
  ];

  // the task for part 1 is to count how many 1s, 4s, 7s, and 8s exist in the outputs
  // those are the digits with unique numbers of segments lit up on a 7SD so they are easy to find
  const UNIQUE_DIGIT_SEGMENTS = [ SEGMENTS_LIT[1].length, SEGMENTS_LIT[4].length, SEGMENTS_LIT[7].length, SEGMENTS_LIT[8].length ];
  const howMany1478s = lines.flatMap(line => line.outputPatterns).filter(digit => UNIQUE_DIGIT_SEGMENTS.includes(digit.length)).length;

  return howMany1478s;
}

function part2(input) {
  const lines = input.trim().split('\n').map(parseLine);

  const outputs = lines.map(({ testPatterns, outputPatterns }) => {
    const digitEncodings = decodeDigits(testPatterns);
    const output = outputPatterns.map(pattern => digitEncodings.get(pattern)).join('');
    return +output;
  });

  return outputs.reduce((sum, output) => sum + output, 0);
}

function parseLine(line) {
  let [ testPatterns, outputPatterns ] = line.split(' | ');
  testPatterns = testPatterns.split(' ').map(pattern => pattern.split('').sort().join(''));
  outputPatterns = outputPatterns.split(' ').map(pattern => pattern.split('').sort().join(''));

  return { testPatterns, outputPatterns };
}

function decodeDigits(testPatterns) {
  const digitEncodings = new Map();
  // 1 is the only one with two segments
  const ONE = testPatterns.filter(pattern => pattern.length === 2)[0];
  digitEncodings.set(ONE, 1);
  testPatterns = testPatterns.filter(pattern => pattern !== ONE);

  // 4 is the only one with four segments
  const FOUR = testPatterns.filter(pattern => pattern.length === 4)[0];
  digitEncodings.set(FOUR, 4);
  testPatterns = testPatterns.filter(pattern => pattern !== FOUR);

  // 7 is the only one with three segments
  const SEVEN = testPatterns.filter(pattern => pattern.length === 3)[0];
  digitEncodings.set(SEVEN, 7);
  testPatterns = testPatterns.filter(pattern => pattern !== SEVEN);

  // 8 is the only one with all seven segments
  const EIGHT = testPatterns.filter(pattern => pattern.length === 7)[0];
  digitEncodings.set(EIGHT, 8);
  testPatterns = testPatterns.filter(pattern => pattern !== EIGHT);

  // 9 can be identified by having six segments, which have all of 4's segments among them
  const NINE = testPatterns.filter(pattern => pattern.length === 6 && FOUR.split('').every(segment => pattern.includes(segment)))[0];
  digitEncodings.set(NINE, 9);
  testPatterns = testPatterns.filter(pattern => pattern !== NINE);

  // 0 can be identified after 9 by having six segments, which have all of 7's segments among them
  const ZERO = testPatterns.filter(pattern => pattern.length === 6 && SEVEN.split('').every(segment => pattern.includes(segment)))[0];
  digitEncodings.set(ZERO, 0);
  testPatterns = testPatterns.filter(pattern => pattern !== ZERO);

  // 6 is the only one left with six segments
  const SIX = testPatterns.filter(pattern => pattern.length === 6)[0];
  digitEncodings.set(SIX, 6);
  testPatterns = testPatterns.filter(pattern => pattern !== SIX);

  // 3 is the only one left that has all of 7's segments in it
  const THREE = testPatterns.filter(pattern => SEVEN.split('').every(segment => pattern.includes(segment)))[0];
  digitEncodings.set(THREE, 3);
  testPatterns = testPatterns.filter(pattern => pattern !== THREE);

  // 2 is the only one left that has the segment that is in 8 but not 6
  const SEGMENT_IN_8_BUT_NOT_6 = EIGHT.split('').filter(segment => !SIX.includes(segment))[0];
  const TWO = testPatterns.filter(pattern => pattern.includes(SEGMENT_IN_8_BUT_NOT_6))[0];
  digitEncodings.set(TWO, 2);
  testPatterns = testPatterns.filter(pattern => pattern !== TWO);

  // 5 is the one left over
  const FIVE = testPatterns[0];
  digitEncodings.set(FIVE, 5);

  return digitEncodings;
}

export default [
  part1,
  part2
];
