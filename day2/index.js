function part1(input) {
  const entries = input.trim().split('\n');
  const commands = lines2commands(entries);

  const position = {
    depth: 0,
    horizontal: 0,
  };

  commands.forEach(command => {
    switch(command.direction) {
      case 'forward':
        position.horizontal += command.units;
        break;
      case 'down':
        position.depth += command.units;
        break;
      case 'up':
        position.depth -= command.units;
        break;
    }
  });

  return position.depth * position.horizontal;
}

function part2(input) {
  const entries = input.trim().split('\n');
  const commands = lines2commands(entries);

  const position = {
    depth: 0,
    horizontal: 0,
    aim: 0,
  };

  commands.forEach(command => {
    switch(command.direction) {
      case 'forward':
        position.horizontal += command.units;
        position.depth += (position.aim * command.units);
        break;
      case 'down':
        position.aim += command.units;
        break;
      case 'up':
        position.aim -= command.units;
        break;
    }
  });

  return position.depth * position.horizontal;
}

function lines2commands(lines) {
  return lines.map(line => {
    const [ direction, units ] = line.split(' ');
    return { direction, units: +units };
  });
}

export default [ part1, part2 ];
