function part1(input) {
  const instructions = parseInput(input);
  const GUESS = 89913949293989;

  const programResult = runAluProgram(instructions, GUESS.toString().split('').map(x => +x));

  return programResult.z === 0;
}

function part2(input) {
  const instructions = parseInput(input);
  const GUESS = 12911816171712;

  const programResult = runAluProgram(instructions, GUESS.toString().split('').map(x => +x));

  return programResult.z === 0;
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const instructions = [];
  for(let line of lines) {
    const [ opcode, ...params ] = line.split(' ');
    const instruction = {
      opcode,
      params: params.map(param => Number.isNaN(+param) ? ({ type: 'register', value: param }) : ({ type: 'literal', value: +param })),
    };

    // some optimizations from what I've noticed in the input
    if(instruction.opcode === 'add' && instruction.params[1].value === 0) { continue; }
    if(instruction.opcode === 'mul' && instruction.params[1].value === 1) { continue; }
    if(instruction.opcode === 'div' && instruction.params[1].value === 1) { continue; }

    instructions.push(instruction);
  }

  return instructions;
}

function runAluProgram(instructions, inputQueue) {
  const R = { w: 0, x: 0, y: 0, z: 0 };
  const OPS = { inp, add, mul, div, mod, eql };

  for(let instruction of instructions) {
    // console.log(`${instruction.opcode} ${instruction.params.map(p => p.value).join(' ')}`);
    // console.log(R);
    OPS[instruction.opcode](...instruction.params);
  }

  return R;

  function _v(param) {
    return param.type === 'register' ? R[param.value] : param.value;
  }

  function inp(a) {
    R[a.value] = inputQueue.shift();
  }

  function add(a, b) {
    R[a.value] = _v(a) + _v(b);
  }

  function mul(a, b) {
    R[a.value] = _v(a) * _v(b);
  }

  function div(a, b) {
    R[a.value] = Math.trunc(_v(a) / _v(b));
  }

  function mod(a, b) {
    R[a.value] = _v(a) % _v(b);
  }

  function eql(a, b) {
    R[a.value] = _v(a) === _v(b) ? 1 : 0;
  }
}

// this function is the result of me manually decompiling the code
// and realizing that z functions as a stack using base 26 place values
function makeRound({m, n, k}) {
  return function(digit, z) {
    let x = z.peek() + m;

    if(k === 26) {
      z.pop();
    }

    if(x !== digit) {
      z.push(digit + n);
    }

    return z;
  }
}

class Stack {
  constructor(arr = []) {
    this._arr = arr.slice();
  }

  push(val) {
    this._arr.push(val);
    return this;
  }

  pop() {
    return this._arr.pop();
  }

  peek() {
    return this._arr.length ? this._arr[this._arr.length - 1] : 0;
  }

  get length() {
    return this._arr.length;
  }

  show() {
    return this._arr.slice();
  }
}

const ROUNDS = [
  { m:  11, n:  1, k:  1}, //  1 [d1+1]
  { m:  10, n: 10, k:  1}, //  2 [d1+1, d2+10]
  { m:  13, n:  2, k:  1}, //  3 [d1+1, d2+10, d3+2]
  { m: -10, n:  5, k: 26}, //  4 [d1+1, d2+10] // d3 + 2 - 10 = d4
  { m:  11, n:  6, k:  1}, //  5 [d1+1, d2+10, d5+6]
  { m:  11, n:  0, k:  1}, //  6 [d1+1, d2+10, d5+6, d6]
  { m:  12, n: 16, k:  1}, //  7 [d1+1, d2+10, d5+6, d6, d7+16]
  { m: -11, n: 12, k: 26}, //  8 [d1+1, d2+10, d5+6, d6] d7 + 16 - 11 = d8
  { m:  -7, n: 15, k: 26}, //  9 [d1+1, d2+10, d5+6] d6 - 7 = d9
  { m:  13, n:  7, k:  1}, // 10 [d1+1, d2+10, d5+6, da+7]
  { m: -13, n:  6, k: 26}, // 11 [d1+1, d2+10, d5+6] da + 7 - 13 = db
  { m:   0, n:  5, k: 26}, // 12 [d1+1, d2+10] d5 + 6 + 0 = dc
  { m: -11, n:  6, k: 26}, // 13 [d1+1] d2 + 10 - 11 = dd
  { m:   0, n: 15, k: 26}, // 14 [] d1 + 1 + 0 = de
];
function runDecompiledAluProgram(inputQueue) {
  return inputQueue.reduce((z, digit, ix) => {
    return makeRound(ROUNDS[ix])(digit, z);
  }, new Stack());
}

/*
// working it out, the largest number would have 9s wherever possible
d1          = 8
d2          = 9
d3          = 9
d4 = d3 - 8 = 1
d5          = 3
d6          = 9
d7          = 4
d8 = d7 + 5 = 9
d9 = d6 - 7 = 2
da          = 9
db = da - 6 = 3
dc = d5 + 6 = 9
dd = d2 - 1 = 8
de = d1 + 1 = 9

largest model number: 89913949293989

// working it out, the smallest number would have 1s wherever possible
d1          = 1
d2          = 2
d3          = 9
d4 = d3 - 8 = 1
d5          = 1
d6          = 8
d7          = 1
d8 = d7 + 5 = 6
d9 = d6 - 7 = 1
da          = 7
db = da - 6 = 1
dc = d5 + 6 = 7
dd = d2 - 1 = 1
de = d1 + 1 = 2

smallest model number: 12911816171712
*/

export default [
  part1,
  part2
];
