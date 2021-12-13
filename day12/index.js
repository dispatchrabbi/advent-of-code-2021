function part1(input) {
  const edges = input.trim().split('\n');

  const caveSystem = new Graph(edges);
  const likelyPaths = findAllLikelyPaths(caveSystem.start, function(neighbor, pathSoFar) {
    return neighbor.isSmall() && pathSoFar.includes(neighbor.name);
  });

  return likelyPaths.length;
}

function part2(input) {
  const edges = input.trim().split('\n');

  const caveSystem = new Graph(edges);
  const likelyPaths = findAllLikelyPaths(caveSystem.start, function(neighbor, pathSoFar) {
    if(neighbor.name === 'start' || neighbor.name === 'end') {
      return pathSoFar.includes(neighbor.name)
    } else if(neighbor.isSmall() && pathSoFar.includes(neighbor.name)) {
      // you can only visit a SINGLE small cave twice, so, if you have visited any small cave twice, no go
      const smallCavesVisited = pathSoFar.filter(name => name === name.toLowerCase());
      const setOfSmallCaveNames = smallCavesVisited.reduce((names, caveName) => names.add(caveName), new Set());
      return setOfSmallCaveNames.size < smallCavesVisited.length;
    }

    return false;
  });

  return likelyPaths.length;
}

class Graph {
  constructor(edges = []) {
    this.nodes = new Map();
    edges.forEach(edge => this.addEdge(edge));
  }

  addEdge(edge) {
    const [ fromName, toName ] = edge.split('-');
    const [ from, to ] = [ this._getNode(fromName), this._getNode(toName) ];
    from.addNeighbor(to);
    to.addNeighbor(from);
  }

  _getNode(name) {
    if(!this.nodes.has(name)) {
      const node = new Node(name);
      this.nodes.set(name, node);
    }

    return this.nodes.get(name);
  }

  get start() {
    return this.nodes.get('start');
  }

  get end() {
    return this.nodes.get('end');
  }
}

class Node {
  constructor(name) {
    this.name = name;
    this.neighbors = new Map();
  }

  isSmall() {
    return this.name === this.name.toLowerCase();
  }

  addNeighbor(neighbor) {
    if(this.neighbors.has(neighbor.name)) {
      return;
    }

    this.neighbors.set(neighbor.name, neighbor);
  }
}

// all likely paths are those that visit small caves no more than the times specified
function findAllLikelyPaths(startNode, isDeadEndFn, pathSoFar = []) {
  pathSoFar.push(startNode.name);

  if(startNode.name === 'end') {
    return [ pathSoFar.slice() ];
  }

  const paths = [...startNode.neighbors.values()].flatMap(neighbor => {
    if(isDeadEndFn(neighbor, pathSoFar)) {
      return [];
    }

    return findAllLikelyPaths(neighbor, isDeadEndFn, pathSoFar.slice());
  });

  return paths;
}

export default [
  part1,
  part2
];
