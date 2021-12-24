function part1(input) {
  let scanners = parseInput(input);
  // console.log(`found ${scanners.length} scanners: ${scanners.map(s => s.id).join(',')}`);

  // assume that the first scanner is oriented up and at [0, 0, 0]; it will be our reference scanner
  scanners[0].locked = true;
  const orientedScanners = [ scanners[0] ];

  // as long as there are still unoriented scanners, we want to try to orient them
  while(orientedScanners.length < scanners.length) {
    // console.log(`trying to orient scanners (${scanners.length - orientedScanners.length} left)`);
    for(let scanner of scanners) {
      if(scanner.locked) { continue; } // this scanner is already oriented

      for(let referenceScanner of orientedScanners) {
        const numberOfCommonBeacons = scanner.determineRelativePositionAndOrientation(referenceScanner);
        if(scanner.locked) {
          // we did it! no need to keep comparing
          orientedScanners.push(scanner);
          break;
        }
      }
    }
  }

  const beacons = scanners.flatMap(scanner => scanner.beacons).reduce((commonBeacons, beaconToAdd) => {
    if(commonBeacons.filter(beacon => isSameBeacon(beacon, beaconToAdd)).length === 0) {
      commonBeacons.push(beaconToAdd);
    }
    return commonBeacons;
  }, []);

  return beacons.length;
}

function part2(input) {
  let scanners = parseInput(input);
  // console.log(`found ${scanners.length} scanners: ${scanners.map(s => s.id).join(',')}`);

  // assume that the first scanner is oriented up and at [0, 0, 0]; it will be our reference scanner
  scanners[0].locked = true;
  const orientedScanners = [ scanners[0] ];

  // as long as there are still unoriented scanners, we want to try to orient them
  while(orientedScanners.length < scanners.length) {
    // console.log(`trying to orient scanners (${scanners.length - orientedScanners.length} left)`);
    for(let scanner of scanners) {
      if(scanner.locked) { continue; } // this scanner is already oriented

      for(let referenceScanner of orientedScanners) {
        const numberOfCommonBeacons = scanner.determineRelativePositionAndOrientation(referenceScanner);
        if(scanner.locked) {
          // we did it! no need to keep comparing
          orientedScanners.push(scanner);
          break;
        }
      }
    }
  }

  // now that all the scanners are oriented, we have to find how far apart the furthest two apart are
  let farthestDistance = -Infinity;
  for(let ix1 = 0; ix1 < scanners.length; ++ix1) {
    for(let ix2 = ix1 + 1; ix2 < scanners.length; ++ix2) {
      farthestDistance = Math.max(farthestDistance, calculateManhattanDistance(scanners[ix1].position, scanners[ix2].position))
    }
  }

  return farthestDistance;
}

function parseInput(input) {
  const lines = input.split('\n');
  const scanners = [];

  let currentScanner = null;
  for(let line of lines) {
    if(line.startsWith('---')) {
      // new scanner (ex. '--- scanner 26 ---')
      const id = +line.substring('--- scanner '.length, line.length - ' ---'.length);
      currentScanner = { id, pings: [] };
    } else if(line.length === 0) {
      // end of a scanner listing
      scanners.push(currentScanner);
      currentScanner = null;
    } else {
      // beacon coordinates (ex. -548,-598,503)
      const coordinates = line.split(',').map(x => +x);
      currentScanner.pings.push(coordinates);
    }
  }

  return scanners.map(scanner => new Scanner(scanner.id, scanner.pings));
}

const  i = [ 1,  0,  0];
const ni = [-1,  0,  0];
const  j = [ 0,  1,  0];
const nj = [ 0, -1,  0];
const  k = [ 0,  0,  1];
const nk =  [0,  0, -1];

const ORIENTATIONS = [
  [ i,  j,  k], [ j,  k,  i], [ k,  i,  j],
  [ k,  j, ni], [ j, ni,  k], [ni,  k,  j],
  [ k, nj,  i], [nj,  i,  k], [ i,  k, nj],
  [nk,  j,  i], [ j,  i, nk], [ i, nk,  j],
  [ni, nj,  k], [nj,  k, ni], [ k, ni, nj],
  [ni,  j, nk], [ j, nk, ni], [nk, ni,  j],
  [ i, nj, nk], [nj, nk,  i], [nk,  i, nj],
  [nk, nj, ni], [nj, ni, nk], [ni, nk, nj],
];

class Scanner {
  constructor(id, pings = []) {
    this.id = id;
    this._pings = pings;

    this.orientation = [i, j, k];
    this.position = [0, 0, 0];
    this.locked = false;

  }

  get orientation() {
    return this._orientation;
  }

  set orientation(orientation) {
    if(this.locked) { throw new Error('attempted to change orientation while locked'); }
    this._orientation = orientation;
    this._calculateBeacons();
    this._calculateEdges();
  }

  get position() {
    return this._position;
  }

  set position(position) {
    if(this.locked) { throw new Error('attempted to change position while locked'); }
    this._position = position;
    this._calculateBeacons();
    this._calculateEdges();
  }

  _calculateBeacons() {
    this.beacons = this._pings.map(ping => orientVector(ping, this._orientation, this._position));
  }

  _calculateEdges() {
    this.edges = [];
    for(let fromBeaconIndex = 0; fromBeaconIndex < this.beacons.length; ++fromBeaconIndex) {
      for(let toBeaconIndex = fromBeaconIndex + 1; toBeaconIndex < this.beacons.length; ++toBeaconIndex) {
        const fromBeacon = this.beacons[fromBeaconIndex];
        const toBeacon = this.beacons[toBeaconIndex];

        this.edges.push({
          from: fromBeacon,
          to: toBeacon,
          vector: [toBeacon[0] - fromBeacon[0], toBeacon[1] - fromBeacon[1], toBeacon[2] - fromBeacon[2]],
        });
      }
    }
  }

  determineRelativePositionAndOrientation(referenceScanner) {
    // first we determine the right orientation
    let commonBeacons = [];
    for(let trialOrientation of ORIENTATIONS) {
      this.orientation = trialOrientation;
      commonBeacons = findCommonBeacons(referenceScanner, this);
      // we need at least 12 common beacons to confirm an orientation
      if(commonBeacons.length >= 12) {
        // console.log('determining position...');
        // now we can determine position
        const referenceBeacon = commonBeacons[0].reference;
        const unknownBeacon = commonBeacons[0].unknown;
        this.position = [
          referenceBeacon[0] - unknownBeacon[0],
          referenceBeacon[1] - unknownBeacon[1],
          referenceBeacon[2] - unknownBeacon[2],
        ];
        // console.log(`position is: ${this._position.join(',')}`);

        this.locked = true;
        // console.log('scanner is locked');
        return commonBeacons.length;
      }
    }

    return 0;
  }
}

function orientVector(vector, orientation, position = [0, 0, 0]) {
  return [
    (vector[0] * orientation[0][0] + vector[1] * orientation[0][1] + vector[2] * orientation[0][2]) + position[0],
    vector[0] * orientation[1][0] + vector[1] * orientation[1][1] + vector[2] * orientation[1][2] + position[1],
    vector[0] * orientation[2][0] + vector[1] * orientation[2][1] + vector[2] * orientation[2][2] + position[2],
  ];
};

function findCommonBeacons(referenceScanner, unknownScanner) {
  const commonBeacons = [];
  function addCommonBeacon(referenceBeacon, unknownBeacon) {
    if(commonBeacons.filter(el => isSameBeacon(el.reference, referenceBeacon)).length === 0) {
      commonBeacons.push({reference: referenceBeacon, unknown: unknownBeacon});
    }
  }

  for(let ix1 = 0; ix1 < referenceScanner.edges.length; ++ix1) {
    for(let ix2 = 0; ix2 < unknownScanner.edges.length; ++ix2) {
      const result = compareVectors(referenceScanner.edges[ix1].vector, unknownScanner.edges[ix2].vector);
      if(result > 0) {
        addCommonBeacon(referenceScanner.edges[ix1].from, unknownScanner.edges[ix2].from);
        addCommonBeacon(referenceScanner.edges[ix1].to, unknownScanner.edges[ix2].to);
      } else if(result < 0) {
        // the edges are going opposite directions, so switch the from and to
        addCommonBeacon(referenceScanner.edges[ix1].from, unknownScanner.edges[ix2].to);
        addCommonBeacon(referenceScanner.edges[ix1].to, unknownScanner.edges[ix2].from);
      }
    }
  }

  return commonBeacons;
}

function compareVectors(u, v) {
  if(u[0] === v[0] && u[1] === v[1] && u[2] === v[2]) {
    return 1;
  } else if(u[0] === -v[0] && u[1] === -v[1] && u[2] === -v[2]) {
    return -1;
  } else {
    return 0;
  }
}

function isSameBeacon(beacon1, beacon2) {
  return beacon1[0] === beacon2[0] && beacon1[1] === beacon2[1] && beacon1[2] === beacon2[2];
}

function calculateManhattanDistance(u, v) {
  return Math.abs(u[0] - v[0]) + Math.abs(u[1] - v[1]) + Math.abs(u[2] - v[2]);
}

export default [
  part1,
  part2
];
