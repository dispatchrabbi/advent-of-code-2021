// This is actually Day 1 from 2020

function part1(input) {
  const entries = input.trim().split('\n');
  const mostCommonBits = getMostCommonBitInEachPlace(entries);

  // there's a way to do this with xor but I'm too lazy to do that right now
  const gammaRate = parseInt(mostCommonBits.join(''), 2);
  const epsilonRate = parseInt(mostCommonBits.map(bit => bit === 0 ? 1 : 0).join(''), 2);

  return gammaRate * epsilonRate;
}

function part2(input) {
  const entries = input.trim().split('\n');

  const oxygenRating = parseInt(filterListByCommonBits(entries), 2);
  const co2Rating = parseInt(filterListByCommonBits(entries, true), 2);

  return oxygenRating * co2Rating;
}

function getMostCommonBitInEachPlace(readings) {
  // count up how many 1s there are in each place
  const totals = readings.reduce(function(totals, reading) {
    reading.split('').forEach((digit, ix) => totals[ix] += (+digit));
    return totals;
  }, Array(readings[0].length).fill(0));

  // construct a new number placewise - if there were more 1s than 0s in each place, it's a 1
  const halfway = readings.length / 2;
  const mostCommonBits = totals.map(count => count >= halfway ? 1 : 0);

  return mostCommonBits;
}

// again, there's a bitflippy way to do this but eh
// if I was writing this for real, I'd do it that way - maybe I'll come back and change it
function filterByPlace(list, place, bitYouWant) {
  return list.filter(entry => bitYouWant === +(entry.substr(place, 1)));
}

function filterListByCommonBits(list, leastInstead) {
  for(let place = 0; list.length > 1; place++) {
    let commonBits = getMostCommonBitInEachPlace(list);
    if(leastInstead) {
      commonBits = commonBits.map(bit => bit === 0 ? 1 : 0)
    }

    list = filterByPlace(list, place, commonBits[place]);
  }

  return list[0];
}

export default [ part1, part2 ];
