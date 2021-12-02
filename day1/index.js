function part1(input) {
  const entries = input.trim().split('\n').map(x => +x);

  let increasedCount = 0;
  for(let i = 0, last = Infinity; i < entries.length; ++i) {
    if(entries[i] > last) {
      increasedCount++;
    }

    last = entries[i];
  }

  return increasedCount;
}

function part2(input) {
  const entries = input.trim().split('\n').map(x => +x);

  let increasedCount = 0;
  for(let i = 2, last = Infinity; i < entries.length; ++i) {
    let current = entries[i - 2] + entries[i - 1] + entries[i];
    if(current > last) {
      increasedCount++;
    }

    last = current;
  }

  return increasedCount;
}

export default [ part1, part2 ];
