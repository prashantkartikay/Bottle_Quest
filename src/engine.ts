// Pure, immutable puzzle engine. No React, no I/O: the same file can run on a Node backend for verification.
export type Bottles = number[][]; // each bottle lists colors bottom -> top
export type Move = { from: number; to: number };
export interface Puzzle { id: string; capacity: number; bottles: Bottles }
export interface Game { capacity: number; initial: Bottles; current: Bottles; history: Bottles[]; moves: number }

export const topColor = (b: number[]) => (b.length ? b[b.length - 1] : -1);
export function topRun(b: number[]): number {
  if (!b.length) return 0;
  const c = b[b.length - 1];
  let n = 0;
  for (let i = b.length - 1; i >= 0 && b[i] === c; i--) n++;
  return n;
}
/** Units a pour from -> to would move (0 = illegal). */
export function pourAmount(bs: Bottles, from: number, to: number, cap: number): number {
  if (from === to || !bs[from] || !bs[to]) return 0;
  const s = bs[from], d = bs[to];
  if (!s.length || d.length >= cap) return 0;
  if (d.length && topColor(d) !== topColor(s)) return 0;
  return Math.min(topRun(s), cap - d.length);
}
export function pour(bs: Bottles, from: number, to: number, cap: number): Bottles {
  const n = pourAmount(bs, from, to, cap);
  if (!n) return bs;
  const next = bs.map((b) => b.slice());
  const c = topColor(next[from]);
  next[from].length -= n;
  for (let i = 0; i < n; i++) next[to].push(c);
  return next;
}
export const isBottleSolved = (b: number[], cap: number) => b.length === 0 || (b.length === cap && b.every((x) => x === b[0]));
export const isWon = (bs: Bottles, cap: number) => bs.every((b) => isBottleSolved(b, cap));
export const sortedCount = (bs: Bottles, cap: number) => bs.filter((b) => b.length === cap && isBottleSolved(b, cap)).length;

export const newGame = (p: Puzzle): Game => ({ capacity: p.capacity, initial: p.bottles, current: p.bottles, history: [], moves: 0 });
export function applyMove(g: Game, from: number, to: number): Game | null {
  const next = pour(g.current, from, to, g.capacity);
  if (next === g.current) return null;
  return { ...g, current: next, history: [...g.history, g.current], moves: g.moves + 1 };
}
export function undo(g: Game): Game {
  if (!g.history.length) return g;
  return { ...g, current: g.history[g.history.length - 1], history: g.history.slice(0, -1), moves: g.moves - 1 };
}
export const restart = (g: Game): Game => ({ ...g, current: g.initial, history: [], moves: 0 });

/** BFS (shortest path, used for par/hints) or DFS (fast solvability check). Returns null if unsolved within `limit` states. */
export function solve(start: Bottles, cap: number, opts: { bfs?: boolean; limit?: number } = {}): Move[] | null {
  const limit = opts.limit ?? 50000;
  const key = (bs: Bottles) => bs.map((b) => b.join('')).sort().join('|');
  const nodes: { s: Bottles; p: number; m: Move | null }[] = [{ s: start, p: -1, m: null }];
  const seen = new Set([key(start)]);
  const open: number[] = [0];
  let head = 0;
  while (opts.bfs ? head < open.length : open.length) {
    const i = opts.bfs ? open[head++] : (open.pop() as number);
    const s = nodes[i].s;
    if (isWon(s, cap)) {
      const path: Move[] = [];
      for (let k = i; nodes[k].m; k = nodes[k].p) path.push(nodes[k].m as Move);
      return path.reverse();
    }
    if (nodes.length > limit) return null;
    for (let a = 0; a < s.length; a++) {
      const src = s[a];
      if (!src.length || (src.length === cap && isBottleSolved(src, cap))) continue;
      const uniform = src.every((x) => x === src[0]);
      for (let b = 0; b < s.length; b++) {
        if (!pourAmount(s, a, b, cap)) continue;
        if (uniform && s[b].length === 0) continue;
        const n = pour(s, a, b, cap), k = key(n);
        if (seen.has(k)) continue;
        seen.add(k);
        nodes.push({ s: n, p: i, m: { from: a, to: b } });
        open.push(nodes.length - 1);
      }
    }
  }
  return null;
}
