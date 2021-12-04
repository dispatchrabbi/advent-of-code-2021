function part1(input) {
  let { numbers, boards } = parseInput(input);

  let winningBoards = [];
  // we can start at 5 numbers because you can't get a bingo before that
  for(let i = 5; winningBoards.length === 0 && i < numbers.length; ++i) {
    boards = boards.map(board => scoreBoard(board, numbers.slice(0, i)));
    winningBoards = boards.filter(boards => boards.won);
  }

  const highestScoringBoard = winningBoards.reduce((currentHighest, board) => (board.score > currentHighest.score ? board : currentHighest), { score: -Infinity });

  return highestScoringBoard.score;
}

function part2(input) {
  let { numbers, boards } = parseInput(input);

  let lastWinningBoard = null;
  // we can start at 5 numbers because you can't get a bingo before that
  for(let i = 5; i < numbers.length; ++i) {
    boards = boards.map(board => scoreBoard(board, numbers.slice(0, i)));
    const winningBoards = boards.filter(boards => boards.won);

    // record the lowest-scoring board of this batch of winners
    if(winningBoards.length > 0) {
      const lowestScoringBoard = winningBoards.reduce((currentLowest, board) => (board.score < currentLowest.score ? board : currentLowest), { score: Infinity });
      lastWinningBoard = lowestScoringBoard;
    }

    // remove the winners from the set of still-playing boards
    boards = boards.filter(board => board.won === false);
  }

  return lastWinningBoard.score;
}

function parseInput(input) {
  let lines = input.trim().split('\n');

  const numbers = lines[0].split(',').map(x => +x);

  const boards = [];
  lines = lines.slice(2);
  while(lines.length > 0) {
    const rows = lines.slice(0, 5).map(row => row.trim().split(/\s+/).map(x => +x));
    // pre-computing rows is a time/space optimization, not sure if it's worth it but eh
    boards.push({ rows, cols: makeBoardCols(rows), won: false, score: null });

    lines = lines.slice(6);
  }

  return { numbers, boards };
}

function makeBoardCols(rows) {
  const cols = [];
  for(let i = 0; i < rows[0].length; ++i) {
    cols.push(rows.map(row => row[i]));
  }

  return cols;
}

function scoreBoard(board, numbersCalled) {
  let won = false;
  let score = null;

  if(numbersCalled.length < 5) {
    return board;
  }

  // check the rows
  for(let rowIx = 0; !won && rowIx < board.rows.length; ++rowIx) {
    won = won || board.rows[rowIx].every(num => numbersCalled.includes(num));
  }

  // check the columns
  for(let colIx = 0; !won && colIx < board.cols.length; ++colIx) {
    won = won || board.cols[colIx].every(num => numbersCalled.includes(num));
  }

  if(won) {
    score = sum([].concat(...board.rows).filter(num => !numbersCalled.includes(num))) * numbersCalled[numbersCalled.length - 1];
  }

  board.won = won;
  board.score = score;
  return board;
}

function sum(nums) {
  return nums.reduce((total, num) => total + num, 0);
}

export default [ part1, part2 ];
