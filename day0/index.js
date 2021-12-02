// This is actually Day 1 from 2020

function part1(input) {
  const entries = input.trim().split('\n').map(x => +x);

  // find the two entries that sum to 2020
  let i, j;
  outside: for(i = 0; i < entries.length; ++i) {
    for(j = i + 1; j < entries.length; ++j) {
      if(entries[i] + entries[j] === 2020) {
        break outside;
      }
    }
  }

  return entries[i] * entries[j];
}

function part2(input) {
  const entries = input.trim().split('\n').map(x => +x);

  // find the two entries that sum to 2020
  let i, j, k;
  outside: for(i = 0; i < entries.length; ++i) {
    for(j = i + 1; j < entries.length; ++j) {
      for(k = j + 1; k < entries.length; ++k)
      if(entries[i] + entries[j] + entries[k] === 2020) {
        break outside;
      }
    }
  }

  return entries[i] * entries[j] * entries[k];
}

export default [ part1, part2 ];
