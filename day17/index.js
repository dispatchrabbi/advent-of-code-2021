function part1(input) {
  const targetArea = parseInput(input);
  const velocityRange = findTestVelocities(targetArea);

  // time to brute force this
  let maxHeight = -Infinity;
  for(var forward = velocityRange.forward.min; forward <= velocityRange.forward.max; ++forward) {
    for(var vertical = velocityRange.vertical.min; vertical <= velocityRange.vertical.max; ++vertical) {
      const maxHeightForThisShot = launchProbe({forward, vertical}, targetArea);
      if(maxHeightForThisShot !== -Infinity && maxHeightForThisShot > maxHeight) {
        maxHeight = Math.max(maxHeight, maxHeightForThisShot);
      }
    }
  }

  return maxHeight;
}

function part2(input) {
  const targetArea = parseInput(input);
  const velocityRange = findTestVelocities(targetArea);

  // time to brute force this
  const velocitiesThatHit = [];
  for(var forward = velocityRange.forward.min; forward <= velocityRange.forward.max; ++forward) {
    for(var vertical = velocityRange.vertical.min; vertical <= velocityRange.vertical.max; ++vertical) {
      const maxHeight = launchProbe({forward, vertical}, targetArea);
      if(maxHeight !== -Infinity) {
        // it hit!
        velocitiesThatHit.push({forward, vertical});
      }
    }
  }

  // velocitiesThatHit.forEach(v => console.log(`${v.forward},${v.vertical}`));
  return velocitiesThatHit.length;
}

function parseInput(input) {
  // ex. target area: x=20..30, y=-10..-5
  const [xRange, yRange] = input.trim().substr('target area: '.length).split(', ');
  const [xMin, xMax] = xRange.substr('x='.length).split('..');
  const [yMin, yMax] = yRange.substr('y='.length).split('..');

  if(xMin > xMax) { [xMin, xMax] = [xMax, xMin]; }
  if(yMin > yMax) { [yMin, yMax] = [yMax, yMin]; }

  return {
    x: { min: +xMin, max: +xMax },
    y: { min: +yMin, max: +yMax },
  };
}

function findTestVelocities(targetArea) {
  // you know, I tried to do a bunch of math and it didn't work out so time to harness the power of computers and be lazy
  // let's start at a minimum forward velocity of 1 (that is a bound that can be improved quite a bit)
  // and the max is just the max of the target area in the x direction (as we might hit it on the first step)

  const minForwardVelocity = 1;
  const maxForwardVelocity = targetArea.x.max;

  // the vertical velocity decreases by 1 every turn
  // if the probe is launched with vertical velocity v, when the probe comes back to y = 0, it'll be going -v
  // so the upper bound (being super naive - and assuming target y is always negative)
  // is the opposite of the minimum y bound in the target area (because after that point, it'll miss totally)
  // that means that the bounds (being super naive) are 1 and absolute values
  // for similar reasons, the minimum is just the minimum of the y range
  const minVerticalVelocity = targetArea.y.min;
  const maxVerticalVelocity = -targetArea.y.min;

  return {
    forward: { min: minForwardVelocity, max: maxForwardVelocity },
    vertical: { min: minVerticalVelocity, max: maxVerticalVelocity},
  };
}

function launchProbe(velocity, targetArea) {
  let position = { x: 0, y: 0 }, hit = false, maxHeight = -Infinity, i = 1;
  while(position.y >= targetArea.y.min) {
    maxHeight = Math.max(maxHeight, position.y);
    if(probeInTargetArea(position, targetArea)) {
      hit = true;
      break;
    }

    ({ position, velocity } = step(position, velocity));
    ++i;
  }

  return hit ? maxHeight : -Infinity;
}

function step(position, velocity) {
  const newPosition = Object.assign({}, position);
  newPosition.x += velocity.forward;
  newPosition.y += velocity.vertical;

  const newVelocity = Object.assign({}, velocity);
  if(newVelocity.forward !== 0) {
    newVelocity.forward += (velocity.forward > 0 ? -1 : 1);
  }
  newVelocity.vertical -= 1;

  return {
    position: newPosition,
    velocity: newVelocity
  };
}

function probeInTargetArea(position, targetArea) {
  const hit = (
    position.x >= targetArea.x.min && position.x <= targetArea.x.max &&
    position.y >= targetArea.y.min && position.y <= targetArea.y.max
  );
  return hit;
}

export default [
  part1,
  part2
];
