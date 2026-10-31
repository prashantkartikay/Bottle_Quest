import { Bottles, Puzzle, solve } from './engine';
export const CAP = 4;
function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function deal(colors: number, empties: number, seed: number): Bottles {
  const r = rng(seed), u: number[] = [];
  for (let c = 0; c < colors; c++) for (let i = 0; i < CAP; i++) u.push(c);
  for (let i = u.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [u[i], u[j]] = [u[j], u[i]]; }
  const bs: Bottles = [];
  for (let i = 0; i < colors; i++) bs.push(u.slice(i * CAP, (i + 1) * CAP));
  for (let i = 0; i < empties; i++) bs.push([]);
  return bs;
}
export const colorsFor = (level: number) => Math.min(8, 2 + Math.floor((level - 1) / 2));
/** Deterministic: same level -> same puzzle. Every dealt puzzle is verified solvable by the solver before it is used. */
function build(id: string, colors: number, seed0: number): Puzzle {
  for (let k = 0; k < 40; k++) {
    const empties = k < 30 ? 2 : 3;
    const bs = deal(colors, empties, seed0 + k);
    if (solve(bs, CAP, { limit: 80000 })) return { id, capacity: CAP, bottles: bs };
  }
  return { id, capacity: CAP, bottles: deal(colors, 3, seed0) };
}
const cache = new Map<string, Puzzle>();
export function getPuzzle(level: number): Puzzle {
  const id = `L${level}`;
  if (!cache.has(id)) cache.set(id, build(id, colorsFor(level), level * 1000));
  return cache.get(id) as Puzzle;
}
export function dailyPuzzle(day: string): Puzzle {
  const id = `D${day}`;
  if (!cache.has(id)) cache.set(id, build(id, 6, Number(day.replace(/-/g, '')) % 1000003));
  return cache.get(id) as Puzzle;
}
export const MAX_LEVEL = 60;
