import chalk from "chalk";

function part1(input) {
  const { nodes, xLength, yLength } = parseInput(input);

  const start = nodes.get(coords2str({ x: 0, y: 0 }));
  start.tentativeRisk = start.riskLevel;

  const pathLength = dijkstra(nodes, { x: 0, y: 0 }, { x: xLength - 1, y: yLength - 1 });

  return pathLength;
}

function part2(input) {
  const pumpedInput = stitchInputBlocks(repeatAndPump(input, 5, 5));
  const { nodes, xLength, yLength } = parseInput(pumpedInput);

  const h = function h({x, y}) {
    return (xLength - x) + (yLength - y);
  };
  const path = aStar(nodes, { x: 0, y: 0 }, { x: xLength - 1, y: yLength - 1 }, h);

  const totalRisk = path.slice(1).reduce((total, node) => total + nodes.get(coords2str(node)).riskLevel, 0);

  return totalRisk;
}

function pumpInput(input, height) {
  return input.trim().split('\n').map(line => {
    return line.split('').map(char => {
      const newHeight = +char+height;
      return newHeight > 9 ? newHeight - 9 : newHeight;
    }).join('');
  }).join('\n');
}

function repeatAndPump(input, xTimes, yTimes) {
  const repeated = [];
  for(let y = 0; y < yTimes; ++y) {
    const row = [];
    for(let x = 0; x < xTimes; ++x) {
      row.push(pumpInput(input, x + y));
    }
    repeated.push(row);
  }
  return repeated;
}

function stitchInputBlocks(blocks) {
  // blocks: [ [ '12\n89', '23\n91' ], [ '23\n91', '34\n12' ] ]
  return blocks.map((blockRow) => {
    // block row: [ '12\n89', '23\n91' ]
    const splitBlockRow = blockRow.map(block => block.split('\n'));
    // split block row: [ ['12', '89'], ['23', '91'] ]
    const newRows = [];
    for(let rowIx = 0; rowIx < splitBlockRow[0].length; ++rowIx) {
      newRows.push(splitBlockRow.map(block => block[rowIx]).join(''));
    }
    return newRows.join('\n');
  }).join('\n');
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const nodes = new Map();
  lines.forEach((line, y) => {
    line.split('').forEach((riskLevel, x) => {
      nodes.set(coords2str({ x, y }), { riskLevel: +riskLevel, tentativeRisk: Infinity });
    });
  });

  return {
    nodes,
    xLength: lines[0].length,
    yLength: lines.length,
  };
}

function dijkstra(nodes, start, end) {
  const startNode = nodes.get(coords2str(start));
  startNode.tentativeRisk = 0;

  // it's not a coding challenge without Dijkstra's algorithm!
  let current = start;
  while(!(current.x === end.x && current.y === end.y)) {
    // get info about the current node
    const currentNode = nodes.get(coords2str(current));

    // mark tentative risk for each of the neighbor nodes (that exist)
    [
      nodes.get(coords2str({ x: current.x + 1, y: current.y })),
      // nodes.get(coords2str({ x: current.x - 1, y: current.y })),
      nodes.get(coords2str({ x: current.x, y: current.y + 1 })),
      // nodes.get(coords2str({ x: current.x, y: current.y - 1 })),
    ].filter(x => x).forEach(neighbor => neighbor.tentativeRisk = Math.min(neighbor.tentativeRisk, currentNode.tentativeRisk + neighbor.riskLevel));

    // remove the current node from the unvisited list
    nodes.delete(coords2str(current));

    // find the node with the smallest tentative risk and make it the new current node
    const smallestRisk = [...nodes.entries()].reduce((currentSmallest, entry) => entry[1].tentativeRisk < currentSmallest[1].tentativeRisk ? entry : currentSmallest, [ null, { tentativeRisk: Infinity } ]);
    current = str2coords(smallestRisk[0]);
  }

  const endNode = nodes.get(coords2str(current));
  return endNode.tentativeRisk;
}

// it's not a coding challenge without something BETTER than Dijkstra's algorithm
// shamelessly stolen from https://en.wikipedia.org/wiki/A*_search_algorithm
function aStar(nodes, start, end, h) {
  // The set of discovered nodes (initially only `start`)
  // We'll be needing to find the node with the smallest f value
  const openSet = new Set();
  openSet.add(coords2str(start));

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start to n currently known.
  const cameFrom = new Map();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  // If the cost is not known, it is Infinity.
  const gScoreMap = new Map();
  gScoreMap.set(coords2str(start), 0);
  function g(coords) {
    return gScoreMap.has(coords2str(coords)) ? gScoreMap.get(coords2str(coords)) : Infinity;
  }

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to how short a path from start to finish can be if it goes through n.
  // If the value is not known, it is Infinity.
  const fScoreMap = new Map();
  fScoreMap.set(coords2str(start), h(start));
  function f(coords) {
    return fScoreMap.has(coords2str(coords)) ? fScoreMap.get(coords2str(coords)) : Infinity;
  }

  while(openSet.size > 0) {
    const current = [...openSet.values()].map(str2coords).reduce((lowest, coords) => (f(coords) < lowest.f ? { coords, f: f(coords)} : lowest), { f: Infinity }).coords;
    if(current.x === end.x && current.y === end.y) {
      return reconstructPath(cameFrom, current);
    }

    // remove the current node from the open set
    openSet.delete(coords2str(current));

    // score each of the neighbors and make a prediction
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];
    neighbors.forEach(neighbor => {
      const neighborNode = nodes.get(coords2str(neighbor));
      if(neighborNode === undefined) { return; }
      // tentative_GScore is the distance from start to the neighbor through current
      const tentativeGScore = g(current) + neighborNode.riskLevel;
      if(tentativeGScore < g(neighbor)) {
        // This path to neighbor is better than any previous one. Record it!
        cameFrom.set(coords2str(neighbor), current);
        gScoreMap.set(coords2str(neighbor), tentativeGScore);
        fScoreMap.set(coords2str(neighbor), tentativeGScore + h(neighbor));
        openSet.add(coords2str(neighbor));
      }
    });
  }

  return null;
}

function reconstructPath(cameFrom, current) {
  const path = [ current ];
  while(cameFrom.has(coords2str(current))) {
    path.unshift(cameFrom.get(coords2str(current)));
    current = path[0];
  }
  return path;
}

function drawFloor(nodes, current, maxes) {
  const floor = [];
  for(let y = 0; y <= maxes.y; ++y) {
    let line = '';
    for(let x = 0; x <= maxes.x; ++x) {
      const nodeInfo = nodes.get(coords2str({ x, y }));
      if(x === current.x && y === current.y) {
        line += chalk.magenta(nodeInfo.riskLevel);
      } else if(!nodeInfo) {
        line += chalk.gray('X');
      } else {
        line += nodeInfo.riskLevel;
      }
    }
    floor.push(line);
  }

  return floor.join('\n');
}

function coords2str({x, y}) {
  return `${x},${y}`;
}

function str2coords(str) {
  const [ x, y ] = str.split(',');
  return { x: +x, y: +y };
}

export default [
  part1,
  part2
];
