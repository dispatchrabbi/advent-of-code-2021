function part1(input) {
  const players = parseInput(input);
  const game = {
    players,
    lastDieRoll: 0,
    turnCounter: 0,
  };

  while(!hasWinningPlayer(game)) {
    takeDeterministicTurn(game);
  }

  return scoreGame(game);
}

function part2(input) {
  const startingPositions = parseInput(input).map(player => player.position);

  // each state includes: current player, p1 position, p2 position, p1 score, p2 score
  let universeTracker = createUniverseTracker();
  universeTracker[0][startingPositions[0]][startingPositions[1]][0][0] = 1;
  let playerWins = [0, 0];

  let eonCounter = 0;
  let universeCount = countUniverses(universeTracker);
  while(universeCount > 0) {
    universeTracker = advanceUniverse(universeTracker, playerWins);

    eonCounter++;
    universeCount = countUniverses(universeTracker);
  }

  return Math.max(playerWins[0], playerWins[1]);
}

function parseInput(input) {
  const startingPositions = input.trim().split('\n').map(line => +line.substr('Player N starting position: '.length));
  const players = startingPositions.map(position => ({
    position: position % 10,
    score: 0,
  }));

  return players;
}

function hasWinningPlayer(game) {
  return game.players.filter(player => player.score >= 1000).length > 0;
}

function takeDeterministicTurn(game) {
  const currentPlayer = game.turnCounter % 2;

  // roll a "deterministic" d100 three times (the 0 face represents 100)
  game.lastDieRoll = (game.lastDieRoll + 1) % 100;
  const dieRoll1 = game.lastDieRoll === 0 ? 100 : game.lastDieRoll;

  game.lastDieRoll = (game.lastDieRoll + 1) % 100;
  const dieRoll2 = game.lastDieRoll === 0 ? 100 : game.lastDieRoll;

  game.lastDieRoll = (game.lastDieRoll + 1) % 100;
  const dieRoll3 = game.lastDieRoll === 0 ? 100 : game.lastDieRoll;

  // move the player forward that many squares (on a board that has squares 1-10 in a loop)
  game.players[currentPlayer].position = (game.players[currentPlayer].position + dieRoll1 + dieRoll2 + dieRoll3) % 10;

  // add the current square to that player's total (the 0 square represents 10)
  game.players[currentPlayer].score += game.players[currentPlayer].position === 0 ? 10 : game.players[currentPlayer].position;

  game.turnCounter++;
}

function scoreGame(game) {
  const losingPlayer = game.players.filter(player => player.score < 1000)[0]; // there should be only one
  // the score is the losing player's score times the number of die rolls there were
  return losingPlayer.score * (game.turnCounter * 3);
}

function createUniverseTracker() {
  // keep track of how many universes are in which states
  // each state includes: current player, p1 position, p2 position, p1 score, p2 score
  return Array(2).fill(0).map(() => Array(10).fill(0).map(() => Array(10).fill(0).map(() => Array(21).fill(0).map(() => Array(21).fill(0)))));
}

function countUniverses(tracker) {
  return tracker.reduce((t, a) => t + a.reduce((t, b) => t + b.reduce((t, c) => t + c.reduce((t, d) => t + d.reduce((t, e) => t + e, 0), 0), 0), 0), 0);
}

const UNIVERSES_CREATED_BY_EACH_ROLL_TOTAL = (function() {
  const universesCreated = new Map();
  for(let roll1 = 1; roll1 <= 3; ++roll1) {
    for(let roll2 = 1; roll2 <= 3; ++roll2) {
      for(let roll3 = 1; roll3 <= 3; ++roll3) {
        const total = roll1 + roll2 + roll3;
        universesCreated.set(total, (universesCreated.get(total) || 0) + 1);
      }
    }
  }
  return universesCreated;
})();
function advanceUniverse(tracker, playerWins) {
  const nextTracker = createUniverseTracker();
  for(let currentPlayer = 0; currentPlayer < 2; ++currentPlayer) {
    for(let p1Pos = 0; p1Pos < 10; ++p1Pos) {
      for(let p2Pos = 0; p2Pos < 10; ++p2Pos) {
        for(let p1Score = 0; p1Score < 21; ++p1Score) {
          for(let p2Score = 0; p2Score < 21; ++p2Score) {
            const universesInThisState = tracker[currentPlayer][p1Pos][p2Pos][p1Score][p2Score];
            if(universesInThisState === 0) { continue; }

            // for each thing you _could_ roll
            [...UNIVERSES_CREATED_BY_EACH_ROLL_TOTAL.entries()].forEach(([roll, createdUniverses]) => {
              // advance the player's position
              const newPos = ((currentPlayer === 0 ? p1Pos : p2Pos) + roll) % 10;
              // add it to the total score
              const newScore = (currentPlayer === 0 ? p1Score : p2Score) + (newPos === 0 ? 10 : newPos);
              // if they win, note it in the winners
              if(newScore >= 21) {
                playerWins[currentPlayer] += universesInThisState * createdUniverses;
              } else {
                // otherwise, put it in the right place in the new tracker
                const [ nextPlayer, nextP1Pos, nextP2Pos, nextP1Score, nextP2Score ] = [
                  (currentPlayer + 1) % 2,
                  currentPlayer === 0 ? newPos : p1Pos,
                  currentPlayer === 1 ? newPos : p2Pos,
                  currentPlayer === 0 ? newScore : p1Score,
                  currentPlayer === 1 ? newScore : p2Score,
                ];
                nextTracker[nextPlayer][nextP1Pos][nextP2Pos][nextP1Score][nextP2Score] += universesInThisState * createdUniverses;
              }
            });
          }
        }
      }
    }
  }

  return nextTracker;
}

export default [
  part1,
  part2
];
