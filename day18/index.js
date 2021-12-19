import chalk from "chalk";

function part1(input) {
  const numbers = input.trim().split('\n').map(line => JSON.parse(line));
  const snumbers = numbers.map(x => new SnailfishNode(x));

  let runningSnotal = snumbers[0];
  for(let i = 1; i < snumbers.length; ++i) {
    // console.log('   ' + runningSnotal.format());
    // console.log(' + ' + snumbers[i].format());
    // console.log(' = ' + snadd(runningSnotal, snumbers[i]).format());
    // console.log('\n');

    runningSnotal = snadd(runningSnotal, snumbers[i]);
  }
  return runningSnotal.magnitude;
}

function part2(input) {
  const numbers = input.trim().split('\n').map(line => JSON.parse(line));
  const snumbers = numbers.map(x => new SnailfishNode(x));

  // find the largest magnitude from adding two snumbers (non-commutative)
  let max = -Infinity;
  for(let a = 0; a < numbers.length; ++a) {
    for(let b = 0; b < numbers.length; ++b) {
      if(a === b) { continue; }
      const sna = new SnailfishNode(numbers[a]);
      const snb = new SnailfishNode(numbers[b]);
      const snum = snadd(sna, snb);

      max = Math.max(max, snum.magnitude);
    }
  }
  return max;
}

function snadd(a, b) {
  const snum = new SnailfishNode([a, b]);
  snum.repathTree();
  snum.reduce();
  return snum;
}

class SnailfishNode {
  constructor(src, parent = null, path = []) {
    this.parent = parent;
    this.path = path;

    this.value = null;
    this.left = null;
    this.right = null;

    if(src instanceof SnailfishNode) {
      src.parent = parent;
      src.path = path;
      return src;
    } else if(src instanceof Array) {
      this._addChildNodes(src);
    } else {
      this._setValue(src);
    }
  }

  _addChildNodes([left, right]) {
    this.left = new SnailfishNode(left, this, this.path.concat('left'));
    this.right = new SnailfishNode(right, this, this.path.concat('right'));
    this.value = null;
  }

  _setValue(val) {
    this.value = val;
    this.left = null;
    this.right = null;
  }

  get level() {
    return this.path.length;
  }

  get magnitude() {
    if(this.isLeaf()) {
      return this.value;
    } else {
      return (3 * this.left.magnitude) + (2 * this.right.magnitude);
    }
  }

  get root() {
    let root = this;
    while(root.parent !== null) {
      root = root.parent;
    }
    return root;
  }

  get nextLeafLeft() {
    // to go left:
    // find the first node in your path whose path ends in true (right)
    let pointer = this;
    while(pointer.parent && pointer.path[pointer.path.length - 1] === 'left') {
      pointer = pointer.parent;
    }
    //(if there is none, you're all the way left)
    if(pointer.parent === null) {
      return null;
    }
    // go the parent and pick the left node,
    pointer = pointer.parent.left;
    // then go down right as far as you can
    while(pointer.right) {
      pointer = pointer.right;
    }

    return pointer;
  }

  get nextLeafRight() {
    // to go right:
    // find the first node in your path whose path ends in true (left)
    let pointer = this;
    while(pointer.parent && pointer.path[pointer.path.length - 1] === 'right') {
      pointer = pointer.parent;
    }
    //(if there is none, you're all the way right)
    if(pointer.parent === null) {
      return null;
    }
    // go the parent and pick the right node,
    pointer = pointer.parent.right;
    // then go down left as far as you can
    while(pointer.left) {
      pointer = pointer.left;
    }

    return pointer;
  }

  isLeaf() {
    return this.value !== null;
  }

  explode() {
    if(this.isLeaf()) {
      throw new Error('cannot explode a leaf node (a.k.a. regular number');
    }

    if(this.left.nextLeafLeft) {
      this.left.nextLeafLeft.value += this.left.value;
    }

    if(this.right.nextLeafRight) {
      this.right.nextLeafRight.value += this.right.value;
    }

    this._setValue(0);
  }

  split() {
    if(!this.isLeaf()) {
      throw new Error('cannot split a non-leaf node (a.k.a. non-regular number');
    }

    this._addChildNodes([Math.floor(this.value / 2), Math.ceil(this.value / 2)]);
  }

  lookForExplodes() {
    if(this.isLeaf()) {
      return false;
    }

    if(this.level >= 4) {
      // console.log('explode', this.format());
      this.explode();
      return true;
    }

    return this.left.lookForExplodes() || this.right.lookForExplodes();
  }

  lookForSplits() {
    if(!this.isLeaf()) {
      return this.left.lookForSplits() || this.right.lookForSplits();
    }

    if(this.value >= 10) {
      // console.log('split', this.format());
      this.split();
      return true;
    }
  }

  reduceOnce() {
    return this.lookForExplodes() || this.lookForSplits();
  }

  reduce() {
    let reduced = false;
    do {
      // console.log(this.format());
      reduced = this.reduceOnce();
    } while(reduced);

    return reduced;
  }

  repathTree() {
    this.root._setPath([]);
  }

  _setPath(path) {
    this.path = path;
    if(!this.isLeaf()) {
      this.left._setPath(this.path.concat('left'));
      this.right._setPath(this.path.concat('right'));
    }
  }

  format() {
    return this.isLeaf() ? chalk[this.value >= 10 ? 'blue' : 'white'](this.value) : chalk[this.level >= 4 ? 'magenta' : 'white'](`[${this.left.format()},${this.right.format()}]`);
  }
}


export default [
  part1,
  part2
];
