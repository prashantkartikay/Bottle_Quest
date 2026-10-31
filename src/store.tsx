import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from './engine';

export type Mode = 'classic' | 'timed' | 'daily';
export interface Saved { mode: Mode; level: number; puzzleId: string; game: Game }
export interface State {
  xp: number; coins: number; unlocked: number; stars: Record<string, number>; best: Record<string, number>;
  streak: number; lastDay: string; dailyDone: string; bestScore: number; saved: Saved | null; haptics: boolean; weekDays: string[];
}
export const INIT: State = { xp: 0, coins: 100, unlocked: 1, stars: {}, best: {}, streak: 0, lastDay: '', dailyDone: '', bestScore: 0, saved: null, haptics: true, weekDays: [] };
const KEY = 'bq:v1';
/** UTC day boundary, matching the server-defined day in the brief. */
export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
export const yesterdayKey = () => dayKey(new Date(Date.now() - 86400000));
export const playerLevel = (xp: number) => Math.floor(xp / 100) + 1;

const Ctx = createContext<{ state: State; update: (f: (s: State) => State) => void } | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INIT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v) setState({ ...INIT, ...JSON.parse(v) }); }).catch(() => {}).finally(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); }, [state, ready]);
  const update = useCallback((f: (s: State) => State) => setState(f), []);
  if (!ready) return null;
  return <Ctx.Provider value={{ state, update }}>{children}</Ctx.Provider>;
}
export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('StoreProvider missing');
  return c;
}
