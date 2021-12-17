import { Buffer } from 'buffer';

function part1(input) {
  const packet = Buffer.from(input.trim(), 'hex');
  const decoded = decodePacket(packet);
  return sumVersionNumbers(decoded);
}

function part2(input) {
  const packet = Buffer.from(input.trim(), 'hex');
  const decoded = decodePacket(packet);
  return bigIntIfNeeded(decoded.value);
}

// mostly needed to make the smaller tests pass
function bigIntIfNeeded(val) {
  const BIGINT_MAX = 2n ** 64n - 1n;
  return BigInt(val) <= BIGINT_MAX ? Number(val) : BigInt(val);
}

// read at `length` bits from `buffer` at an offset of `offset` bits
// length must be at most 18 (because that's the shortest string that might span 4 bytes)
// TODO: make this read up to 32 bits at a time
function readBits(buffer, offset, length) {
  if(length > 18) { throw new Error('cannot read more than 18 bits at a time'); }

  const firstByteNeeded = Math.floor(offset / 8);
  const offsetIntoFirstByte = offset % 8;

  let bytesNeeded = Math.ceil(length / 8);
  if((offset % 8) + length > bytesNeeded * 8) {
    bytesNeeded += 1;
  }

  const leftoverBits = (bytesNeeded * 8) - (offset % 8) - length;

  let bits = 0;
  for(let bytes = 0; bytes < bytesNeeded; ++bytes) {
    const byte = buffer.readUInt8(firstByteNeeded + bytes);
    bits = (bits << 8) | byte;
  }

  const originalBits = bits;
  // this is a weird way to do it, but okeedoke
  bits = bits >>> leftoverBits << (32 - length) >>> (32 - length);

  return bits;
}

// return a new buffer with the same contents as `buffer`,
// starting from an offset of `offset` bits and going for `length` bits
// this will be padded out to a multiple of 8 bits with 0s
function sliceBuffer(buffer, offset, length = Infinity) {
  if(length === Infinity) {
    length = (buffer.length * 8) - offset;
  }

  const sliceBuffer = Buffer.alloc(Math.ceil(length / 8) + 1);
  const endIndex = offset + length;
  for(let cursor = offset, ix = 0; cursor < endIndex + 8; cursor += 8, ix += 1) {
    let someBits;
    const leftToGo = endIndex - cursor;
    if(leftToGo < 8) {
      someBits = readBits(buffer, cursor, leftToGo) << (8 - leftToGo);
    } else {
      someBits = readBits(buffer, cursor, 8);
    }
    sliceBuffer.writeUInt8(someBits, ix);
  }

  return sliceBuffer;
}

const PACKET_TYPES = {
  SUM: 0,
  PRODUCT: 1,
  MINIMUM: 2,
  MAXIMUM: 3,
  LITERAL: 4,
  GREATER_THAN: 5,
  LESS_THAN: 6,
  EQUAL_TO: 7,
};
function decodePacket(packet) {
  // second 3 bits are the packet type
  const type = readBits(packet, 3, 3);
  // console.log(`Attempting to decode packet (type ${type}):`);
  console.group();


  let decoded;
  if(type == PACKET_TYPES.LITERAL) {
    decoded = decodeLiteralPacket(packet);
  } else {
    decoded = decodeOperatorPacket(packet);
  }

  console.groupEnd();
  return decoded;
}

function decodeLiteralPacket(packet) {
  // console.log(`Decoding literal packet (size ${packet.length * 8})...`);
  let cursor = 6; // skipping the version and type fields
  let literal = 0n;
  let bitGroup;

  // read 5 bits over and over
  // each group of bits has a 1-bit header (1 = keep going, 0 = last group)
  // and 4 bits of actual literal number info; string together all the 4-bit groups
  do {
    bitGroup = readBits(packet, cursor, 5);
    cursor += 5;

    literal <<= 4n;
    literal |= BigInt(bitGroup & 0x0F);
  } while(bitGroup & 0x10);

  // console.log(`literal was: ${literal}`);
  // console.log('...decoded.');
  return {
    version: readBits(packet, 0, 3),
    type: readBits(packet, 3, 3),
    length: cursor,
    value: literal,
  };
}

const MODES = {
  TOTAL_BIT_LENGTH: 0,
  NUMBER_OF_SUBPACKETS: 1
}
const OPERATIONS = {
  [PACKET_TYPES.SUM]: subpackets => subpackets.reduce((total, subpacket) => total + subpacket.value, 0n),
  [PACKET_TYPES.PRODUCT]: subpackets => subpackets.reduce((product, subpacket) => product * subpacket.value, 1n),
  [PACKET_TYPES.MINIMUM]: subpackets => subpackets.reduce((min, subpacket) => min < subpacket.value ? min : subpacket.value, Infinity),
  [PACKET_TYPES.MAXIMUM]: subpackets => subpackets.reduce((max, subpacket) => max > subpacket.value ? max : subpacket.value, -Infinity),
  [PACKET_TYPES.GREATER_THAN]: subpackets => (subpackets[0].value > subpackets[1].value ? 1n : 0n),
  [PACKET_TYPES.LESS_THAN]: subpackets => (subpackets[0].value < subpackets[1].value ? 1n : 0n),
  [PACKET_TYPES.EQUAL_TO]: subpackets => (subpackets[0].value === subpackets[1].value ? 1n : 0n),
};
function decodeOperatorPacket(packet) {
  // console.log(`Decoding operator packet (size ${packet.length * 8})...`);
  // console.log(`packet starts with: ${readBits(packet, 0, 7).toString(2)}`);
  let cursor = 6; // skipping the version and type fields
  const subpackets = [];

  const mode = readBits(packet, cursor, 1);
  cursor += 1;

  if(mode === MODES.TOTAL_BIT_LENGTH) {
    // console.log(`...total bit length mode...`);
    const totalBitLength = readBits(packet, cursor, 15);
    cursor += 15;

    // console.log(`bitlength expected: ${totalBitLength}`);
    const cursorTarget = cursor + totalBitLength;
    while(cursor < cursorTarget) {
      const nextPacket = decodePacket(sliceBuffer(packet, cursor));
      subpackets.push(nextPacket);
      cursor += nextPacket.length;
    }
  } else {
    // console.log(`...number of subpackets mode...`);
    const numberOfSubpacketsExpected = readBits(packet, cursor, 11);
    cursor += 11;

    // console.log(`subpackets expected: ${numberOfSubpacketsExpected}`);
    while(subpackets.length < numberOfSubpacketsExpected) {
      // console.log({cursor});
      const nextPacket = decodePacket(sliceBuffer(packet, cursor));
      subpackets.push(nextPacket);
      cursor += nextPacket.length;
    }
  }

  const type = readBits(packet, 3, 3);
  const value = OPERATIONS[type](subpackets);
  // console.log('...decoded.');
  return {
    version: readBits(packet, 0, 3),
    type,
    value,
    length: cursor,
    subpackets,
  }
}

const REVERSE_PACKET_TYPES = Object.entries(PACKET_TYPES).reduce((obj, [type, num]) => (obj[num] = type, obj), {});
function printPacket(packet, cursor = 0) {
  console.log(`PACKET v.${packet.version} (cursor: ${cursor}, len: ${packet.length})`);
  console.log(`type: ${REVERSE_PACKET_TYPES[packet.type]} (${packet.subpackets ? packet.subpackets.map(subpacket => subpacket.value).join(' ') : packet.value})`);
  console.log(`result: ${packet.value}`);

  cursor += packet.length - (packet.subpackets ? packet.subpackets.reduce((total, subpacket) => total + subpacket.length, 0) : 0);

  if(packet.subpackets) {
    console.log(`subpackets:`);
    console.group();
    packet.subpackets.forEach(subpacket => {
      printPacket(subpacket, cursor);
      cursor += subpacket.length;
    });
    console.groupEnd();
  }
}

function sumVersionNumbers(packet) {
  let sum = packet.version;
  if(packet.subpackets) {
    for(let subpacket of packet.subpackets) {
      sum += sumVersionNumbers(subpacket);
    }
  }
  return sum;
}

export default [
  part1,
  part2
];
