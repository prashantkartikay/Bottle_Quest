import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Switch, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { Go, Route } from '../../App';
import Bottle from '../components/Bottle';
import { Btn, Card, Label, Serif } from '../components/ui';
import { Game, Move, applyMove, isWon, newGame, restart, solve, sortedCount, undo } from '../engine';
import { MAX_LEVEL, dailyPuzzle, getPuzzle } from '../levels';
import { dayKey, useStore, yesterdayKey } from '../store';
import { C, F } from '../theme';
import { showRewardedHintAd } from '../ads';

const HINT_COST = 20;
type Result = { won: boolean; stars: number; coins: number; xp: number; score: number; repeat: boolean };

export default function Play({ route, go, onExit }: { route: Route; go: Go; onExit: () => void }) {
  const { state, update } = useStore();
  const { mode, level, seconds } = route;
  const puzzle = useMemo(() => (mode === 'daily' ? dailyPuzzle(dayKey()) : getPuzzle(level)), [mode, level]);
  const par = useMemo(() => solve(puzzle.bottles, puzzle.capacity, { bfs: true, limit: 30000 })?.length ?? puzzle.bottles.filter((b) => b.length).length * 3, [puzzle]);
  const resume = state.saved && state.saved.puzzleId === puzzle.id && state.saved.mode === mode ? state.saved.game : null;
  const [game, setGame] = useState<Game>(() => resume ?? newGame(puzzle));
  const [sel, setSel] = useState<number | null>(null);
  const [bad, setBad] = useState<number | null>(null);
  const [hint, setHint] = useState<Move | null>(null);
  const [free, setFree] = useState(1);
  const [remaining, setRemaining] = useState(seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [note, setNote] = useState('');
  const lock = useRef(false);
  const { width } = useWindowDimensions();
  const buzz = (k: 'light' | 'medium' | 'error') => {
    if (!state.haptics) return;
    if (k === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    else Haptics.impactAsync(k === 'light' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  // Countdown exists only in timed mode. Classic/daily never render or run a timer.
  // NOTE: client-side clock for UX only; a real backend must own the authoritative start time.
  useEffect(() => {
    if (mode !== 'timed' || paused || result) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [mode, paused, result]);
  useEffect(() => {
    if (mode === 'timed' && remaining <= 0 && !result) { buzz('error'); setResult({ won: false, stars: 0, coins: 0, xp: 0, score: 0, repeat: false }); }
  }, [remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (i: number) => { setBad(i); buzz('error'); setTimeout(() => setBad(null), 350); };

  function finish(g: Game, left: number) {
    const stars = g.moves <= par + 2 ? 3 : g.moves <= Math.ceil(par * 1.5) ? 2 : 1;
    const day = dayKey();
    const repeat = mode === 'daily' && state.dailyDone === day; // no duplicate daily rewards
    const first = !state.stars[puzzle.id];
    const coins = repeat ? 0 : mode === 'daily' ? 50 + stars * 10 : first ? 20 + stars * 5 : 5;
    const xp = repeat ? 0 : 30 + stars * 10;
    const score = Math.max(0, 1000 + (mode === 'timed' ? left * 10 : 0) - g.moves * 5);
    const streak = state.lastDay === day ? state.streak : state.lastDay === yesterdayKey() ? state.streak + 1 : 1;
    const weekAgo = dayKey(new Date(Date.now() - 6 * 86400000));
    update((s) => ({
      ...s, coins: s.coins + coins, xp: s.xp + xp, streak, lastDay: day, saved: null, bestScore: Math.max(s.bestScore, score),
      weekDays: Array.from(new Set([...s.weekDays, day])).filter((d) => d >= weekAgo),
      unlocked: mode === 'classic' ? Math.min(MAX_LEVEL, Math.max(s.unlocked, level + 1)) : s.unlocked,
      dailyDone: mode === 'daily' ? day : s.dailyDone,
      stars: { ...s.stars, [puzzle.id]: Math.max(s.stars[puzzle.id] ?? 0, stars) },
      best: { ...s.best, [puzzle.id]: Math.min(s.best[puzzle.id] ?? 9999, g.moves) },
    }));
    setResult({ won: true, stars, coins, xp, score, repeat });
  }
  function persist(g: Game) {
    if (mode === 'timed') return;
    update((s) => ({ ...s, saved: g.moves ? { mode, level, puzzleId: puzzle.id, game: g } : null }));
  }

  function tap(i: number) {
    if (lock.current || paused || result) return; // guards rapid double taps
    setHint(null);
    const b = game.current;
    if (sel === null) { if (b[i].length) { setSel(i); buzz('light'); } else flash(i); return; }
    if (sel === i) { setSel(null); return; }
    const next = applyMove(game, sel, i);
    if (!next) { flash(sel); setSel(b[i].length ? i : null); return; } // invalid: shake the source, then switch selection
    lock.current = true; setTimeout(() => { lock.current = false; }, 180);
    setGame(next); setSel(null); buzz('medium');
    if (isWon(next.current, next.capacity)) finish(next, remaining); else persist(next);
  }
  function doUndo() { if (result || paused) return; const g = undo(game); setGame(g); setSel(null); setHint(null); persist(g); }
  function doRestart() { const g = restart(game); setGame(g); setSel(null); setHint(null); setPaused(false); persist(g); if (mode === 'timed') setRemaining(seconds ?? 0); }
  async function doRewardedHint() {
    if (result || paused) return;
    setNote('Loading rewarded ad…');
    const rewarded = await showRewardedHintAd();
    if (!rewarded) {
      setNote('Ad unavailable. You can use your regular hint.');
      setTimeout(() => setNote(''), 2200);
      return;
    }
    const path = solve(game.current, game.capacity, { limit: 30000 });
    if (!path || !path.length) {
      setNote('No hint available from here. Try Undo.');
      setTimeout(() => setNote(''), 1800);
      return;
    }
    setHint(path[0]);
    setSel(null);
    setNote('Reward earned! Follow the highlighted move.');
    setTimeout(() => setNote(''), 2200);
  }

  function doHint() {
    if (result || paused) return;
    if (free <= 0 && state.coins < HINT_COST) { setNote(`Need ${HINT_COST} coins for a hint`); setTimeout(() => setNote(''), 1800); return; }
    const path = solve(game.current, game.capacity, { limit: 30000 });
    if (!path || !path.length) { setNote('No hint available from here. Try Undo.'); setTimeout(() => setNote(''), 1800); return; }
    if (free > 0) setFree(free - 1); else update((s) => ({ ...s, coins: s.coins - HINT_COST }));
    setHint(path[0]); setSel(null);
  }

  const n = game.current.length, cols = Math.ceil(n / 2), gap = 14;
  const bw = Math.min(64, (width - 48 - (cols - 1) * gap) / cols), bh = Math.min(176, bw * 2.75);
  const rows = [game.current.slice(0, cols), game.current.slice(cols)];
  const total = puzzle.bottles.filter((b) => b.length).length;
  const clock = `${Math.floor(Math.max(remaining, 0) / 60)}:${String(Math.max(remaining, 0) % 60).padStart(2, '0')}`;
  const title = mode === 'daily' ? 'Daily Challenge' : `Level ${level}`;
  const sub = mode === 'classic' ? 'CLASSIC · UNTIMED' : mode === 'timed' ? 'TIME RUSH' : dayKey();
  const stat = (k: string, v: string, color: string = C.text) => (<View style={{ alignItems: 'center' }}><Label>{k}</Label><Serif size={26} color={color}>{v}</Serif></View>);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
        <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontSize: 24 }}>‹</Text></Pressable>
        <View style={{ alignItems: 'center' }}><Serif size={24}>{title}</Serif><Label>{sub}</Label></View>
        <Pressable onPress={() => setPaused(true)} accessibilityRole="button" accessibilityLabel="Pause" style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontFamily: F.bold }}>II</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 24, marginTop: 18, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(247,201,107,0.22)' }}>
        {stat('MOVES', String(game.moves))}
        {mode === 'timed' ? stat('TIME', clock, remaining <= 10 ? C.bad : C.text) : stat('BEST', state.best[puzzle.id] ? String(state.best[puzzle.id]) : '–')}
        {stat('SORTED', `${sortedCount(game.current, game.capacity)} / ${total}`, C.aqua)}
      </View>
      <Text style={{ textAlign: 'center', color: note ? C.gold : C.sub, fontFamily: F.body, fontSize: 13, marginTop: 12 }} accessibilityLiveRegion="polite">{note || 'Fill each bottle with a single color'}</Text>
      <View style={{ flex: 1, justifyContent: 'center', gap: 40 }}>
        {rows.map((r, ri) => (
          <View key={ri} style={{ flexDirection: 'row', justifyContent: 'center', gap }}>
            {r.map((units, ci) => {
              const i = ri * cols + ci;
              return <Bottle key={i} index={i} units={units} cap={game.capacity} w={bw} h={bh} selected={sel === i} bad={bad === i} hint={hint?.from === i || hint?.to === i} onPress={() => tap(i)} />;
            })}
          </View>
        ))}
      </View>
      <View style={{ gap: 9, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Undo" style={{ flex: 1 }} disabled={!game.history.length} onPress={doUndo} />
          <Btn gold label={free > 0 ? 'Hint · free' : `Hint · ${HINT_COST}`} style={{ flex: 1 }} onPress={doHint} />
          <Btn label="Restart" style={{ flex: 1 }} onPress={doRestart} />
        </View>
        <Btn label="Watch ad for an extra hint" onPress={doRewardedHint} />
      </View>

      <Modal transparent visible={paused && !result} animationType="fade" onRequestClose={() => setPaused(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(16,13,32,0.88)', justifyContent: 'center', padding: 24 }}>
          <Card style={{ padding: 22, gap: 12 }}>
            <Serif size={30}>Paused</Serif>
            {mode === 'timed' && <Text style={{ color: C.sub, fontFamily: F.body }}>The clock is stopped while paused. On a server-verified run, pauses are capped.</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: C.text, fontFamily: F.bold }}>Haptics</Text>
              <Switch value={state.haptics} onValueChange={(v) => update((s) => ({ ...s, haptics: v }))} trackColor={{ true: C.accent, false: '#3a3052' }} accessibilityLabel="Haptics" />
            </View>
            <Btn primary label="Resume" onPress={() => setPaused(false)} />
            <Btn label="Restart level" onPress={doRestart} />
            <Btn label="Quit to menu" onPress={onExit} />
          </Card>
        </View>
      </Modal>

      <Modal transparent visible={!!result} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(16,13,32,0.92)', justifyContent: 'center', padding: 24 }}>
          {result && (
            <Card style={{ padding: 24, gap: 12, alignItems: 'center', borderColor: result.won ? 'rgba(247,201,107,0.4)' : C.line }}>
              <Serif size={34}>{result.won ? 'Level complete' : 'Time’s up'}</Serif>
              {result.won && <Text style={{ fontSize: 34, color: C.gold }} accessibilityLabel={`${result.stars} of 3 stars`}>{'★'.repeat(result.stars) + '☆'.repeat(3 - result.stars)}</Text>}
              <Text style={{ color: C.sub, fontFamily: F.body, textAlign: 'center' }}>
                {result.won ? `${game.moves} moves (par ${par})${mode === 'timed' ? ` · ${clock} left` : ''}\nScore ${result.score.toLocaleString()} · local, not server-verified` : 'Restart to try the same puzzle again.'}
              </Text>
              {result.won && <Text style={{ color: C.gold, fontFamily: F.bold }}>{result.repeat ? 'Daily reward already claimed today' : `+${result.coins} coins · +${result.xp} XP`}</Text>}
              <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 8 }}>
                {result.won && mode === 'classic' && level < MAX_LEVEL && <Btn primary label="Next level" onPress={() => go({ mode: 'classic', level: level + 1 })} />}
                <Btn label={result.won ? 'Replay' : 'Try again'} onPress={() => go({ mode, level, seconds })} />
                <Btn label="Home" onPress={onExit} />
              </View>
            </Card>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
