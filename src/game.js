export const BOARD_SIZE = 6;

const basePieces = [
  { id: 'R', x: 0, y: 2, length: 2, axis: 'h', sprite: 0, name: 'Scarlet Fastback', target: true },
  { id: 'A', x: 2, y: 0, length: 3, axis: 'v', sprite: 2, name: 'Woodside Wagon' },
  { id: 'B', x: 3, y: 0, length: 2, axis: 'h', sprite: 1, name: 'Turquoise Tailfin' },
  { id: 'C', x: 5, y: 0, length: 2, axis: 'v', sprite: 5, name: 'Midnight Custom' },
  { id: 'D', x: 3, y: 3, length: 2, axis: 'v', sprite: 8, name: 'Copper Compact' },
  { id: 'E', x: 0, y: 3, length: 2, axis: 'v', sprite: 4, name: 'Forest Deluxe' },
  { id: 'F', x: 1, y: 3, length: 2, axis: 'h', sprite: 3, name: 'Golden Pickup' },
  { id: 'G', x: 4, y: 2, length: 2, axis: 'v', sprite: 6, name: 'Navy Street King' },
  { id: 'H', x: 3, y: 5, length: 3, axis: 'h', sprite: 9, name: 'Ivory Cruiser' }
];

const cloneWithSprites = (spriteShift, changes = {}) => basePieces.map((piece) => ({
  ...piece,
  sprite: piece.target ? 0 : (piece.sprite + spriteShift) % 12,
  ...(changes[piece.id] || {})
}));

export const LEVELS = [
  {
    id: 1,
    title: 'Sunday Drive',
    era: '50s',
    subtitle: 'The diner closes at sundown.',
    par: 6,
    pieces: cloneWithSprites(0)
  },
  {
    id: 2,
    title: 'Main Street',
    era: '60s',
    subtitle: 'Clear the lane past the picture house.',
    par: 6,
    pieces: cloneWithSprites(3, {
      D: { sprite: 11, name: 'Burgundy Roadster' },
      H: { sprite: 2, name: 'Cream Country Squire' }
    })
  },
  {
    id: 3,
    title: 'Scenic Route',
    era: '70s',
    subtitle: 'One last stretch before the county line.',
    par: 6,
    pieces: cloneWithSprites(6, {
      B: { sprite: 6, name: 'Navy Muscle Coupe' },
      F: { sprite: 10, name: 'Olive Grand Tourer' }
    })
  },
  {
    id: 4,
    title: 'Victory Boulevard',
    era: '40s',
    subtitle: 'Homeward traffic fills the boulevard.',
    par: 6,
    pieces: cloneWithSprites(9, {
      B: { sprite: 10, name: 'Ivory Streamliner' },
      H: { sprite: 5, name: 'Blackout Sedan' }
    })
  }
];

export function occupancy(pieces, ignoredId) {
  const grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  pieces.forEach((piece) => {
    if (piece.id === ignoredId) return;
    for (let n = 0; n < piece.length; n += 1) {
      const x = piece.x + (piece.axis === 'h' ? n : 0);
      const y = piece.y + (piece.axis === 'v' ? n : 0);
      if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) grid[y][x] = piece.id;
    }
  });
  return grid;
}

export function getMoveRange(piece, pieces) {
  const grid = occupancy(pieces, piece.id);
  const start = piece.axis === 'h' ? piece.x : piece.y;
  let min = start;
  let max = start;

  if (piece.axis === 'h') {
    while (min > 0 && !grid[piece.y][min - 1]) min -= 1;
    while (max + piece.length < BOARD_SIZE && !grid[piece.y][max + piece.length]) max += 1;
  } else {
    while (min > 0 && !grid[min - 1][piece.x]) min -= 1;
    while (max + piece.length < BOARD_SIZE && !grid[max + piece.length][piece.x]) max += 1;
  }
  return { min, max };
}

export function movePiece(pieces, id, coordinate) {
  return pieces.map((piece) => {
    if (piece.id !== id) return piece;
    return piece.axis === 'h' ? { ...piece, x: coordinate } : { ...piece, y: coordinate };
  });
}

export function isSolved(pieces) {
  const target = pieces.find((piece) => piece.target);
  return target.x === BOARD_SIZE - target.length;
}
