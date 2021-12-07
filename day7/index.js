function part1(input) {
  const crabPositions = input.trim().split(',');

  // count how many crabs there are at each position
  const crabCounts = crabPositions.reduce((counts, position) => counts.set(position, (counts.get(position) || 0) + 1), new Map());

  // calculate the fuel for each position and keep the lowest one
  const farthestPosition = [...crabCounts.keys()].reduce((farthest, position) => Math.max(farthest, position), 0);
  let lowestFuel = Infinity;
  for(let position = 0; position <= farthestPosition; ++position) {
    lowestFuel = Math.min(lowestFuel, calculateFuelCostPart1(crabCounts, position));
  }

  return lowestFuel;
}

function part2(input) {
  const crabPositions = input.trim().split(',');

  // count how many crabs there are at each position
  const crabCounts = crabPositions.reduce((counts, position) => counts.set(position, (counts.get(position) || 0) + 1), new Map());

  // calculate the fuel for each position and keep the lowest one
  const farthestPosition = [...crabCounts.keys()].reduce((farthest, position) => Math.max(farthest, position), 0);
  let lowestFuel = Infinity;
  for(let position = 0; position <= farthestPosition; ++position) {
    lowestFuel = Math.min(lowestFuel, calculateFuelCostPart2(crabCounts, position));
  }

  return lowestFuel;
}

// in part 1, each crab move costs 1 fuel
function calculateFuelCostPart1(crabCounts, targetPosition) {
  let fuelCost = 0;
  for(let [ position, count ] of crabCounts) {
    fuelCost += Math.abs(position - targetPosition) * count;
  }
  return fuelCost;
}

// in part 2, every move a crab makes costs 1 more than the one before it
// so moving 1 costs 1, but moving 2 costs (1 + 2), and moving 3 costs (1 + 2 + 3)
// these are triangular numbers, and the formula for the nth one is (n * (n+1) / 2)
function calculateFuelCostPart2(crabCounts, targetPosition) {
  let totalFuelCost = 0;
  for(let [ position, count ] of crabCounts) {
    const positionDifference = Math.abs(position - targetPosition);
    const fuelCost = (positionDifference * (positionDifference + 1)) / 2;
    totalFuelCost += (fuelCost * count);
  }
  return totalFuelCost;
}

export default [
  part1,
  part2
];
