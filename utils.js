function draw2dArray(arr, onOffFn = (val) => !!val) {
  // first we get a 2d array of all 0's that will be the size of our drawing
  const ySize = Math.ceil(arr.length / 4);
  const xSize = Math.ceil(arr[0].length / 2);
  let canvas = (new Array(ySize)).fill(0).map(() => (new Array(xSize)).fill(0));

  // then we go through each coordinate in the input array and
  // set (or don't set) the appropriate bit in the appropriate element
  for(let y = 0; y < arr.length; ++y) {
    for(let x = 0; x < arr[y].length; ++x) {
      const offsets = coords2BrailleOffsets(x, y);
      if(onOffFn(arr[y][x])) {
        canvas[offsets.y][offsets.x] = canvas[offsets.y][offsets.x] | (1 << offsets.bit);
      }
    }
  }

  // then we replace each number with the correct braille char by offsetting U+2800 by the number
  // and we combine all the braille chars into a string
  canvas = canvas.map(row => row.map(charOffset => String.fromCodePoint(0x2800 + charOffset)).join('')).join('\n');
  return canvas;
}

/*
if you have a bitmap/binary int:
  76543210
0bNNNNNNNN

then adding it to U+2800 gets you a braille char with those dots:
03
14
25
67
*/
function coords2BrailleOffsets(x, y) {
  const xPos = Math.floor(x / 2);
  const yPos = Math.floor(y / 4);

  const xOffset = x % 2;
  const yOffset = y % 4;
  const bit = xOffset === 0 ? [ 0, 1, 2, 6 ][yOffset] : [ 3, 4, 5, 7 ][yOffset];

  return { x: xPos, y: yPos, bit };
}

export {
  draw2dArray
};
