function part1(input) {
  const startingBurrow = parseInput(input);

  const gameSpace = new GameStateGraph(startingBurrow.hash());
  const shortestSolution = gameSpace.findBestSolution();
  // console.log(shortestSolution.path.join('\n'));

  return shortestSolution.cost;
}

function part2(input) {
  const lines = input.trim().split('\n');
  // this is highly unusual!
  const startingBurrow = parseInput([
    ...lines.slice(0, 3),
    '  #D#C#B#A#',
    '  #D#B#A#C#',
    ...lines.slice(3),
  ].join('\n'));

  const gameSpace = new GameStateGraph(startingBurrow.hash());
  const shortestSolution = gameSpace.findBestSolution();
  // console.log(shortestSolution.path.join('\n'));

  return shortestSolution.cost;
}

function parseInput(input) {
  const HALLWAY_REGEX = /^#([.]+)#$/;
  const ROOM_REGEX = /^\W*#([ABCD])#([ABCD])#([ABCD])#([ABCD])#\W*$/;

  const burrow = {
    hallway: [],
    rooms: {
      'A': [],
      'B': [],
      'C': [],
      'D': [],
    },
  };

  const lines = input.trim().split('\n');
  for(let line of lines) {
    const hallwayMatch = HALLWAY_REGEX.exec(line);
    if(hallwayMatch) {
      burrow.hallway = Array(hallwayMatch[1].length).fill(null);
      continue;
    }

    const roomMatch = ROOM_REGEX.exec(line);
    if(roomMatch) {
      burrow.rooms.A.push(roomMatch[1]);
      burrow.rooms.B.push(roomMatch[2]);
      burrow.rooms.C.push(roomMatch[3]);
      burrow.rooms.D.push(roomMatch[4]);
      continue;
    }
  }

  return new Burrow(burrow.hallway, burrow.rooms);
}

const COSTS = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000
};
class Burrow {
  constructor(hallway = [], rooms = { A: [], B: [], C: [], D: [] }) {
    this.hallway = hallway;
    this.rooms = rooms;

    const midpoint = Math.floor(this.hallway.length / 2);
    this.entrances = {
      A: midpoint - 3,
      B: midpoint - 1,
      C: midpoint + 1,
      D: midpoint + 3,
    };
  }

  format() {
    const lines = [];
    const paddingLength = (this.hallway.length + 2 - '#A#B#C#D#'.length) / 2;

    lines.push(Array(this.hallway.length + 2).fill('#').join(''));
    lines.push('#' + this.hallway.map(c => c === null ? '.' : c).join('') + '#');
    lines.push(...this.rooms.A.map((el, ix) => {
      const middle = '#' + Object.keys(this.rooms).map(roomType => this.rooms[roomType][ix] || '.').join('#') + '#';
      const padding = Array(paddingLength).fill(ix === 0 ? '#' : ' ').join('');
      return padding + middle + padding;
    }));
    lines.push(Array(paddingLength).fill(' ').join('') + '#########' + Array(paddingLength).fill(' ').join(''));

    return lines.join('\n');
  }

  clone() {
    return new Burrow(this.hallway.slice(), {
      A: this.rooms.A.slice(),
      B: this.rooms.B.slice(),
      C: this.rooms.C.slice(),
      D: this.rooms.D.slice(),
    });
  }

  hash() {
    const enhash = arr => arr.map(cell => cell === null ? '.' : cell).join('');
    return enhash(this.hallway) + '|' + Object.values(this.rooms).map(room => enhash(room)).join('|');
  }

  static fromHash(hash) {
    const dehash = str => str.split('').map(cell => cell === '.' ? null : cell);
    const parts = hash.split('|');
    return new Burrow(dehash(parts[0]), { A: dehash(parts[1]), B: dehash(parts[2]), C: dehash(parts[3]), D: dehash(parts[4]) });
  }

  static createWinningHash(hash) {
    // If I was doing this for real, I'd turn the hash into a Burrow and modify it from there
    // but I am using a load-bearing hash so I'm going to depend on that structure
    let [ hallway, a, b, c, d ] = hash.split('|');

    hallway = hallway.split('').fill('.').join('');
    a = a.split('').fill('A').join('');
    b = b.split('').fill('B').join('');
    c = c.split('').fill('C').join('');
    d = d.split('').fill('D').join('');

    return [ hallway, a, b, c, d ].join('|');
  }

  findPossibleMoves() {
    if(this.isDone()) {
      return [];
    }

    return [
      ...this._findMovesOutToHallway(),
      ...this._findMovesIntoRooms()
    ].sort((a, b) => a.cost - b.cost);
  }

  _findMovesOutToHallway() {
    const moves = [];

    // for each spot in the hallway:
    const entranceSpots = Object.values(this.entrances);
    for(let spot = 0; spot < this.hallway.length; ++spot) {
      // - can it be moved into? (it can't be on top of a room)
      if(entranceSpots.includes(spot)) { continue; }

      // - can any of the top amphipods in the rooms move into the space?
      for(let roomType of Object.keys(this.rooms)) {
        // first note that an amphipod won't come out if it's in a room with only its type
        if(this._isRoomHomogenous(this.rooms[roomType])) { continue; }

        // make sure that there is an amphipod in the room to come out
        const topAmphipodSpot = this.rooms[roomType].findIndex(cell => cell !== null);
        if(topAmphipodSpot === -1) { continue; }
        const topAmphipodType = this.rooms[roomType][topAmphipodSpot];

        // then check for blockers between that room and the current spot
        const interveningHallway = this.hallway.slice(Math.min(spot, this.entrances[roomType]), Math.max(spot, this.entrances[roomType]) + 1);
        const canMove = interveningHallway.every(cell => cell === null);
        if(canMove) {
          const next = this.clone();
          next.hallway[spot] = topAmphipodType;
          next.rooms[roomType][topAmphipodSpot] = null;

          const roomSteps = this.rooms[roomType].filter(cell => cell === null).length;
          const hallwaySteps = interveningHallway.length;

          moves.push({
            next: next.hash(),
            cost: COSTS[topAmphipodType] * (roomSteps + hallwaySteps)
          });
        }
      }
    }


    return moves;
  }

  _findMovesIntoRooms() {
    const moves = [];

    // for each room:
    for(let roomType of Object.keys(this.rooms)) {
      // - can it be moved into? (all amphipods in the room (if any) must be the right type)
      if(this._isRoomHomogenous(this.rooms[roomType], roomType)) {
        // - if so, which amphipods of that type in the hallway have a clear way to the room?
        const goal = this.entrances[roomType];
        this.hallway.forEach((amphipod, ix) => {
          if(amphipod !== roomType) { return; }
          const nextSpotOver = ix + (goal < ix ? -1 : 1);
          const interveningHallway = this.hallway.slice(Math.min(goal, nextSpotOver), Math.max(goal, nextSpotOver) + 1);
          const canMove = interveningHallway.every(cell => cell === null);

          if(canMove) {
            const next = this.clone();
            next.hallway[ix] = null;
            next.rooms[roomType] = next.rooms[roomType].concat([roomType]).slice(1); // fill in the room from the far end

            const hallwaySteps = Math.abs(goal - ix);
            const roomSteps = this.rooms[roomType].filter(cell => cell === null).length;
            moves.push({
              next: next.hash(),
              cost: COSTS[roomType] * (hallwaySteps + roomSteps),
            });
          }
        });
      }
    }

    return moves;
  }

  _isRoomHomogenous(room, type) {
    return room.every(cell => cell === null || cell === type);
  }

  isDone() {
    const hallwayDone = this.hallway.every(cell => cell === null);
    const roomsDone = Object.keys(this.rooms).map(roomType => this.rooms[roomType].every(cell => cell === roomType)).every(result => result === true);

    return hallwayDone && roomsDone;
  }

  heuristicDistanceToDone() {
    let heuristic = 0;

    // how much energy would it cost for each amphipod to get to its hallway?
    this.hallway.forEach((amphipod, ix) => {
      if(amphipod === null) { return; }
      heuristic += COSTS[amphipod] * Math.abs(ix - this.entrances[amphipod]);
    });

    Object.keys(this.rooms).forEach(roomType => {
      const roomClone = this.rooms[roomType].slice();
      for(let i = 0; i < roomClone.length; ++i) {
        if(roomClone[i] === roomType) { break; }
        heuristic += COSTS[roomType] * (i+1);
      }
    });

    return heuristic;
  }
}

class GameStateGraph {
  constructor(rootHash) {
    this.nodes = new Set();
    this.nodes.add(rootHash)

    this.root = rootHash;
    this.winningHash = Burrow.createWinningHash(this.root);
  }

  findBestSolution() {
    function reconstructPath(cameFrom, current) {
      const totalPath = [ current ];
      while(current = cameFrom.get(current)) {
        totalPath.unshift(current);
      }

      return totalPath;
    }

    function makeMapWithDefaultValue(defaultValue) {
      const _map = new Map();
      const _get = _map.get;
      _map.get = function(key) {
        const result = _get.call(_map, key);
        return result === undefined ? defaultValue : result;
      }

      return _map;
    }

    const openSet = new Set();
    const cameFrom = new Map(); // hash -> hash

    const f = makeMapWithDefaultValue(Infinity); // hash -> int
    const g = makeMapWithDefaultValue(Infinity); // hash -> int
    function h(node) {
      const hBurrow = Burrow.fromHash(node);
      const heuristicCost = hBurrow.heuristicDistanceToDone();
      return heuristicCost;
    }

    let currentNode = this.root;
    openSet.add(currentNode);
    f.set(currentNode, h(currentNode));
    g.set(currentNode, 0);

    while(openSet.size > 0) {
      currentNode = [...openSet.values()].reduce((winner, node) => f.get(node) < f.get(winner) ? node : winner);
      if(currentNode === this.winningHash) {
        return {
          cost: g.get(currentNode),
          path: reconstructPath(cameFrom, currentNode),
        };
      }

      openSet.delete(currentNode);
      const currentBurrow = Burrow.fromHash(currentNode);
      for(let possibleMove of currentBurrow.findPossibleMoves()) {
        const costThroughThisPath = g.get(currentNode) + possibleMove.cost;
        if(costThroughThisPath < g.get(possibleMove.next)) {
          cameFrom.set(possibleMove.next, currentNode);
          g.set(possibleMove.next, costThroughThisPath);
          f.set(possibleMove.next, costThroughThisPath + h(possibleMove.next));
          openSet.add(possibleMove.next);
        }
      }
    }

    return null;
  }

}

export default [
  part1,
  part2
];
