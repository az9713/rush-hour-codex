import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_SIZE, LEVELS, getMoveRange, isSolved, movePiece, occupancy } from '../src/game.js';

test('every puzzle begins with valid, non-overlapping pieces', () => {
  for (const level of LEVELS) {
    const seen = new Set();
    for (const piece of level.pieces) {
      for (let n = 0; n < piece.length; n += 1) {
        const x = piece.x + (piece.axis === 'h' ? n : 0);
        const y = piece.y + (piece.axis === 'v' ? n : 0);
        assert.ok(x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE, `${level.title}: ${piece.id} is in bounds`);
        const key = `${x},${y}`;
        assert.ok(!seen.has(key), `${level.title}: ${piece.id} does not overlap`);
        seen.add(key);
      }
    }
  }
});

test('the Sunday Drive route can be solved in six moves', () => {
  let pieces = LEVELS[0].pieces.map((piece) => ({ ...piece }));
  for (const [id, coordinate] of [['E', 4], ['F', 0], ['A', 3], ['B', 1], ['G', 0], ['R', 4]]) {
    const piece = pieces.find((item) => item.id === id);
    const range = getMoveRange(piece, pieces);
    assert.ok(coordinate >= range.min && coordinate <= range.max, `${id} can move to ${coordinate}`);
    pieces = movePiece(pieces, id, coordinate);
  }
  assert.equal(isSolved(pieces), true);
});

test('occupancy can ignore the moving piece', () => {
  const pieces = LEVELS[0].pieces;
  const grid = occupancy(pieces, 'R');
  assert.equal(grid[2][0], null);
  assert.equal(grid[2][2], 'A');
});
