function part1(input) {
  const seaFloor = input.trim().split('\n').map(line => line.split('').map(x => +x));

  let totalRisk = 0;
  for(let y = 0; y < seaFloor.length; ++y) {
    for(let x = 0; x < seaFloor[y].length; ++x) {
      if(isLocalLow(seaFloor, x, y)) {
        totalRisk += (seaFloor[y][x] + 1);
      }
    }
  }

  return totalRisk;
}

function part2(input) {
  const seaFloor = input.trim().split('\n').map(line => line.split('').map(x => +x));

  const basins = [];
  for(let y = 0; y < seaFloor.length; ++y) {
    for(let x = 0; x < seaFloor[y].length; ++x) {
      if(isLocalLow(seaFloor, x, y)) {
        basins.push(chartAdjacentBasin(seaFloor, x, y));
      }
    }
  }

  // sort largest first
  const sortedBasins = basins.sort((a, b) => b.size - a.size);

  return sortedBasins[0].size * sortedBasins[1].size * sortedBasins[2].size;
}

function formatBasin(seaFloor, basin) {
  return seaFloor.map((line, y) => line.map((height, x) => basin.has(`${x},${y}`) ? `${height}` : '.').join('')).join('\n');
}

function isLocalLow(seaFloor, x, y) {
  const X_BOUND = seaFloor[0].length - 1;
  const Y_BOUND = seaFloor.length - 1;

  let isLow = true;
  const centralHeight = seaFloor[y][x];

  // compare to the north (if there is a north)
  if(y-1 >= 0) { isLow = isLow && centralHeight < seaFloor[y-1][x]; }

  // compare to the south (if there is a south)
  if(y+1 <= Y_BOUND) { isLow = isLow && centralHeight < seaFloor[y+1][x]; }

  // compare to the east (if there is a east)
  if(x+1 <= X_BOUND) { isLow = isLow && centralHeight < seaFloor[y][x+1]; }

  // compare to the west (if there is a west)
  if(x-1 >= 0) { isLow = isLow && centralHeight < seaFloor[y][x-1]; }

  return isLow;
}

function chartAdjacentBasin(seaFloor, x, y) {
  const localBasin = new Set();

  const centralHeight = seaFloor[y][x];
  if(centralHeight === 9) {
    return new Set();
  }

  // this is going to be inefficient because this algorithm will go over the same ground several times
  // I could fix it by checking if we've visited somewhere and just skipping it but... eh
  const X_BOUND = seaFloor[0].length - 1;
  const Y_BOUND = seaFloor.length - 1;

  // compare to the north (if there is a north)
  if(y-1 >= 0 && centralHeight < seaFloor[y-1][x]) {
    const northBasin = chartAdjacentBasin(seaFloor, x, y-1);
    concatSet(localBasin, chartAdjacentBasin(seaFloor, x, y-1));
  }

  // compare to the south (if there is a south)
  if(y+1 <= Y_BOUND && centralHeight < seaFloor[y+1][x]) {
    concatSet(localBasin, chartAdjacentBasin(seaFloor, x, y+1));
  }

  // compare to the east (if there is a east)
  if(x+1 <= X_BOUND && centralHeight < seaFloor[y][x+1]) {
    concatSet(localBasin, chartAdjacentBasin(seaFloor, x+1, y));
  }

  // compare to the west (if there is a west)
  if(x-1 >= 0 && centralHeight < seaFloor[y][x-1]) {
    concatSet(localBasin, chartAdjacentBasin(seaFloor, x-1, y));
  }

  localBasin.add(`${x},${y}`);
  return localBasin;
}

function concatSet(target, src) {
  src.forEach(val => target.add(val));
  return target;
}

export default [
  part1,
  part2
];
