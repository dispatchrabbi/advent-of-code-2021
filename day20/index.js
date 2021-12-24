const LIGHT_PIXEL = '#';
const DARK_PIXEL = '.';

function part1(input) {
  let { image, enhancer } = parseInput(input);

  for(let step = 0; step < 2; ++step) {
    image = enhanceImage(image, enhancer);
  }

  return image.lights.size;
}

function part2(input) {
  let { image, enhancer } = parseInput(input);

  for(let step = 0; step < 50; ++step) {
    image = enhanceImage(image, enhancer);
  }

  return image.lights.size;
}

function renderImage(image) {
  const imageRows = [];
  for(let y = image.yMin - 4; y <= image.yMax + 4; ++y) {
    const pixels = [];
    for(let x = image.xMin - 4; x <= image.xMax + 4; ++x) {
      pixels.push(image.isLit({x, y}) ? LIGHT_PIXEL : DARK_PIXEL);
    }
    imageRows.push(pixels.join(''));
  }
  return imageRows.join('\n');
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  // this is now a set of the indices for which the enhancer will say the pixel should be light
  const enhancer = new Set(lines[0].split('').map((pixel, ix) => pixel === LIGHT_PIXEL ? ix : null).filter(el => el !== null));

  const image = new Image();
  const imageLines = lines.slice(2);
  imageLines.forEach((line, yIndex) => {
    line.split('').forEach((pixel, xIndex) => {
      if(pixel === LIGHT_PIXEL) {
        image.addLight({x: xIndex, y: yIndex});
      }
    });
  });

  return { image, enhancer };
}

function point2str(point) {
  return `${point.x},${point.y}`;
}

function str2point(str) {
  const coords = str.split(',');
  return { x: coords[0], y: coords[1] };
}

class Image {
  constructor(assumeOutsideIsLight = false) {
    this.xMin = Infinity;
    this.xMax = -Infinity;
    this.yMin = Infinity;
    this.yMax = -Infinity;
    this.lights = new Set();

    this.assumeOutsideIsLight = assumeOutsideIsLight;
  }

  addLight(point) {
    this.lights.add(point2str(point));

    this.xMin = Math.min(this.xMin, point.x);
    this.xMax = Math.max(this.xMax, point.x);
    this.yMin = Math.min(this.yMin, point.y);
    this.yMax = Math.max(this.yMax, point.y);
  }

  isInBounds(point) {
    return point.x >= this.xMin && point.x <= this.xMax && point.y >= this.yMin && point.y <= this.yMax;
  }

  isLit(point) {
    if(this.isInBounds(point)) {
      return this.lights.has(point2str(point));
    } else {
      return this.assumeOutsideIsLight;
    }
  }
}

function enhanceImage(original, enhancer) {
  const enhanced = new Image(enhancer.has(0) ? !original.assumeOutsideIsLight : false);

  for(let y = original.yMin - 1; y <= original.yMax + 1; ++y) {
    for(let x = original.xMin - 1; x <= original.xMax + 1; ++x) {
      if(enhancePixel({ x, y }, original, enhancer)) {
        enhanced.addLight({ x, y });
      }
    }
  }

  return enhanced;
}

function enhancePixel(pixel, image, enhancer) {
  const enhancementIndex = getNeighbors(pixel)
    .map(point => image.isLit(point) ? 1 : 0)
    .reduce((num, bit) => (num << 1 | bit), 0);

  return enhancer.has(enhancementIndex);
}

function getNeighbors(point) {
  return [
    { x: point.x-1, y: point.y-1 }, { x: point.x, y: point.y-1 }, { x: point.x+1, y: point.y-1 },
    { x: point.x-1, y: point.y }, { x: point.x, y: point.y }, { x: point.x+1, y: point.y },
    { x: point.x-1, y: point.y+1 }, { x: point.x, y: point.y+1 }, { x: point.x+1, y: point.y+1 },
  ];
}

export default [
  part1,
  part2
];
