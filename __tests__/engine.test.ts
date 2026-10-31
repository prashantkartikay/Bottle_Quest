import { applyMove, isWon, newGame, pour, pourAmount, restart, solve, undo } from '../src/engine';
import { CAP, MAX_LEVEL, dailyPuzzle, getPuzzle } from '../src/levels';

const P = { id: 't', capacity: 4, bottles: [[0, 1, 1], [1, 0, 0, 0], [], [1]] };
test('pours the max consecutive top run', () => {
  expect(pourAmount([[0, 1, 1], [], [1]], 0, 1, 4)).toBe(2);
  expect(pour([[0, 1, 1], []], 0, 1, 4)).toEqual([[0], [1, 1]]);
});
test('respects destination color and capacity', () => {
  expect(pourAmount([[0, 1], [0, 0, 0, 0]], 0, 1, 4)).toBe(0);
  expect(pourAmount([[0, 1], [1, 1, 1]], 0, 1, 4)).toBe(1);
  expect(pourAmount([[0, 0, 0], [0, 0]], 0, 1, 4)).toBe(2);
  expect(pourAmount([[], [0]], 0, 1, 4)).toBe(0);
  expect(pourAmount([[0], [0]], 0, 0, 4)).toBe(0);
});
test('undo restores the exact previous state, restart the initial one', () => {
  const g0 = newGame(P), g1 = applyMove(g0, 0, 3)!, g2 = applyMove(g1, 1, 2)!;
  expect(g2.moves).toBe(2);
  expect(undo(g2).current).toEqual(g1.current);
  expect(restart(g2).current).toEqual(P.bottles);
  expect(g0.current).toEqual(P.bottles); // immutability
  expect(applyMove(g0, 2, 0)).toBeNull();
});
test('win detection', () => {
  expect(isWon([[0, 0, 0, 0], [1, 1, 1, 1], []], 4)).toBe(true);
  expect(isWon([[0, 0, 0], [1, 1, 1, 1], [0]], 4)).toBe(false);
});
test('solver returns a path that wins', () => {
  const path = solve(P.bottles, 4, { bfs: true })!;
  let b = P.bottles;
  path.forEach((m) => { b = pour(b, m.from, m.to, 4); });
  expect(isWon(b, 4)).toBe(true);
});
test('every level and the daily puzzle are solvable and deterministic', () => {
  for (let l = 1; l <= MAX_LEVEL; l++) {
    const p = getPuzzle(l);
    expect(solve(p.bottles, CAP, { limit: 200000 })).not.toBeNull();
    expect(p.bottles.flat().length).toBe(p.bottles.filter((b) => b.length).length * CAP);
  }
  expect(dailyPuzzle('2026-10-31')).toEqual(dailyPuzzle('2026-10-31'));
  expect(solve(dailyPuzzle('2026-10-31').bottles, CAP, { limit: 200000 })).not.toBeNull();
});
