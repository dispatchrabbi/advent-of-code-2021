function part1(input) {
  const steps = parseInput(input);

  const reactorCubes = new Set();
  steps.forEach(step => executeStep(step, reactorCubes));

  return reactorCubes.size;
}

function parseInput(input) {
  const steps = input.trim().split('\n').map(line => {
    const [ set, ranges ] = line.split(' ');
    const [ x, y, z ] = ranges.split(',').map(range => {
      const [ min, max ] = range.substr('N='.length).split('..').map(x => +x);
      return { min, max };
    });
    return { set, x, y, z };
  });

  return steps;
}

function executeStep(step, reactorCubes) {
  // first we clamp the ranges in the step in all directions
  const [ xRange, yRange, zRange ] = [ clampRange(step.x), clampRange(step.y), clampRange(step.z) ];
  if(xRange === null || yRange === null || zRange === null) {
    // the range was outside working parameters, we can skip
    return;
  }

  // then we iterate over those ranges and activate or deactivate the cubes in the range
  const method = step.set === 'on' ? 'add' : 'delete';
  for(let x = xRange.min; x <= xRange.max; ++x) {
    for(let y = yRange.min; y <= yRange.max; ++y) {
      for(let z = zRange.min; z <= zRange.max; ++z) {
        reactorCubes[method](cube2str({x, y, z}));
      }
    }
  }
}

const RANGE = {
  MIN: -50,
  MAX: 50,
};
function clampRange({min, max}) {
  if(min > RANGE.MAX || max < RANGE.MIN) {
    return null;
  }

  return {
    min: Math.max(RANGE.MIN, min),
    max: Math.min(RANGE.MAX, max),
  };
}

function cube2str(cube) {
  return `${cube.x},${cube.y},${cube.z}`;
}

// Once again, we need a different approach for part 2
// we're going to have to keep track of the cuboids that are on after each step
// breaking them apart as we add and remove cuboids
function part2(input) {
  const steps = parseInput2(input);

  let reactorCubes = [];
  for(let step of steps) {
    reactorCubes = executeStep2(step, reactorCubes);
  }

  return reactorCubes.reduce((total, cuboid) => total + getCuboidVolume(cuboid), 0);
}

function formatCuboid(cuboid) {
  return `<${cuboid.x.min}..${cuboid.x.max},${cuboid.y.min}..${cuboid.y.max},${cuboid.z.min}..${cuboid.z.max},>`;
}

function parseInput2(input) {
  const steps = input.trim().split('\n').map(line => {
    const [ set, ranges ] = line.split(' ');
    const [ x, y, z ] = ranges.split(',').map(range => {
      const [ min, max ] = range.substr('N='.length).split('..').map(x => +x);
      return { min, max: max + 1 };
    });
    return { set, cuboid: { x, y, z } };
  });

  return steps;
}

function executeStep2(step, reactorCubes) {
  if(step.set === 'on') {
    return reactorCubes.reduce((nextCubes, existingCuboid) => {
      nextCubes.push(...removeCuboid(existingCuboid, step.cuboid));
      return nextCubes;
    }, [ step.cuboid ]);
  } else {
    return reactorCubes.flatMap(existingCuboid => removeCuboid(existingCuboid, step.cuboid));
  }
}

function isSameCuboid(a, b) {
  return (
    a.x.min === b.x.min && a.x.max === b.x.max &&
    a.y.min === b.y.min && a.y.max === b.y.max &&
    a.z.min === b.z.min && a.z.max === b.z.max
  );
}

function isValidCuboid(cuboid) {
  return cuboid.x.min < cuboid.x.max && cuboid.y.min < cuboid.y.max && cuboid.z.min < cuboid.z.max;
}

function findCuboidIntersection(a, b) {
  return {
    x: { min: Math.max(a.x.min, b.x.min), max: Math.min(a.x.max, b.x.max) },
    y: { min: Math.max(a.y.min, b.y.min), max: Math.min(a.y.max, b.y.max) },
    z: { min: Math.max(a.z.min, b.z.min), max: Math.min(a.z.max, b.z.max) },
  };
}

function removeCuboid(minuend, subtrahend) {
  const intersection = findCuboidIntersection(minuend, subtrahend);
  if(!isValidCuboid(intersection)) {
    return [ minuend ];
  }

  function makeBounds(minuendRange, subtrahendRange) {
    // section 1: outer.min -> min(inner.min, outer.max)
    // section 2: max(outer.min, inner.min) -> min(inner.max, outer.max)
    // section 3: max(outer.min, inner.max) -> outer.max
    const bounds = [
      { min: minuendRange.min, max: Math.min(subtrahendRange.min, minuendRange.max) },
      { min: Math.max(minuendRange.min, subtrahendRange.min), max: Math.min(subtrahendRange.max, minuendRange.max) },
      { min: Math.max(minuendRange.min, subtrahendRange.max), max: minuendRange.max },
    ];
    return bounds;
  }
  const xBounds = makeBounds(minuend.x, subtrahend.x);
  const yBounds = makeBounds(minuend.y, subtrahend.y);
  const zBounds = makeBounds(minuend.z, subtrahend.z);

  const cuboids = [];
  for(let x of xBounds) {
    for(let y of yBounds) {
      for(let z of zBounds) {
        // console.log(formatCuboid({x, y, z}));
        cuboids.push({x, y, z});
      }
    }
  }

  // filter out invalid cuboids and the original cuboid we're subtracting
  return cuboids.filter(cuboid => isValidCuboid(cuboid) && !isSameCuboid(cuboid, intersection));
}


function getCuboidVolume(cuboid) {
  const xLength = cuboid.x.max - cuboid.x.min;
  const yLength = cuboid.y.max - cuboid.y.min;
  const zLength = cuboid.z.max - cuboid.z.min;

  if(xLength <= 0 || yLength <= 0 || zLength <= 0) {
    return 0;
  }

  return xLength * yLength * zLength;
}

export default [
  part1,
  part2
];
