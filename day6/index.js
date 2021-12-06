// these two functions do exactly the same thing except for the number of days to simulate
// that said, I'm leaving part 1 with my original solution and part 2 with the improved solution

function part1(input) {
  let school = input.trim().split(',').map(x => +x);

  const DAYS_TO_SIMULATE = 80;
  for(let day = 0; day < DAYS_TO_SIMULATE; ++day) {
    school = tickSchool(school);
  }

  return school.length;
}

function part2(input) {
  const fishAges = input.trim().split(',').map(x => +x);
  const school = new School(fishAges);

  const DAYS_TO_SIMULATE = 256;
  for(let day = 0; day < DAYS_TO_SIMULATE; ++day) {
    school.tick();
  }

  return school.countFish();
}

const FIRST_CYCLE_MAX_AGE = 8;
const NORMAL_CYCLE_MAX_AGE = 6;

function tickSchool(school) {
  const numFishAboutToSpawn = school.filter(fish => fish === 0).length;
  const newFish = Array(numFishAboutToSpawn).fill(FIRST_CYCLE_MAX_AGE);

  school = school.map(fish => fish === 0 ? NORMAL_CYCLE_MAX_AGE : fish - 1).concat(newFish);
  return school;
}

class School {
  constructor(fishAges) {
    this.fishCounts = Array(FIRST_CYCLE_MAX_AGE + 1).fill(0).map((_, ix) => fishAges.filter(age => age === ix).length);
  }

  tick() {
    const nextFishCounts = Array(FIRST_CYCLE_MAX_AGE + 1).fill(0).map((_, ix) => {
      if(ix === FIRST_CYCLE_MAX_AGE) {
        return this.fishCounts[0]; // spawn as many new fish as were at age 0
      } else if(ix === NORMAL_CYCLE_MAX_AGE) {
        return this.fishCounts[0] + this.fishCounts[NORMAL_CYCLE_MAX_AGE + 1]; // the original fish at 0 join other fish counting down
      } else {
        return this.fishCounts[ix + 1];
      }
    });

    this.fishCounts = nextFishCounts;
  }

  countFish() {
    return this.fishCounts.reduce((total, count) => total + count, 0);
  }
}

export default [
  part1,
  part2
];
