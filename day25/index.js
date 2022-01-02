function part1(input) {
  const cucumberField = new CucumberField(input);
  const stepsUntilSettled = cucumberField.settle();

  return stepsUntilSettled;
}

function part2(input) {
  // There is no part 2 for day 25!
}

class CucumberField {
  constructor(field) {
    this.field = field.trim().split('\n').map(line => line.split(''));
  }

  settle() {
    let stepCounter = 1;
    while(this.step() > 0) {
      stepCounter++;
    }

    return stepCounter;
  }

  step() {
    const eastFacingMoves = this.findCucumberMoves(true);
    this.moveCucumbers(eastFacingMoves, true);

    const southFacingMoves = this.findCucumberMoves(false);
    this.moveCucumbers(southFacingMoves, false);

    return eastFacingMoves.length + southFacingMoves.length;
  }

  moveCucumbers(moves, eastFacing) {
    const shape = eastFacing ? '>' : 'v';

    moves.forEach(move => {
      const next = this.findNextSpot(move, eastFacing);
      this.field[next.y][next.x] = shape;
      this.field[move.y][move.x] = '.';
    });
  }

  findCucumberMoves(eastFacing) {
    const moves = [];

    const shape = eastFacing ? '>' : 'v';
    for(let y = 0; y < this.field.length; ++y) {
      for(let x = 0; x < this.field[y].length; ++x) {
        if(this.field[y][x] === shape && this.canMove({x, y}, eastFacing)) {
          moves.push({x, y});
        }
      }
    }

    return moves;
  }

  canMove({x, y}, eastFacing) {
    const next = this.findNextSpot({x, y}, eastFacing);
    return this.field[next.y][next.x] === '.';
  }

  findNextSpot({x, y}, eastFacing) {
    if(eastFacing) {
      x = (x + 1) % this.field[y].length;
    } else {
      y = (y + 1) % this.field.length;
    }

    return { x, y };
  }

  format() {
    return this.field.map(line => line.join('')).join('\n');
  }
}

export default [
  part1,
  // part2
];
