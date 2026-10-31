import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Go } from '../../App';
import { Btn, Card, Label, Serif } from '../components/ui';
import { dayKey, useStore } from '../store';
import { C, F } from '../theme';

const RUSH = [['Relaxed Rush', 120], ['Standard Rush', 90], ['Expert Rush', 60]] as const;
function untilNextDay() {
  const d = new Date(), next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  const s = Math.max(0, Math.floor((next - Date.now()) / 1000));
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
}
export default function Challenges({ go }: { go: Go }) {
  const { state } = useStore();
  const [left, setLeft] = useState(untilNextDay());
  useEffect(() => { const id = setInterval(() => setLeft(untilNextDay()), 30000); return () => clearInterval(id); }, []);
  const done = state.dailyDone === dayKey();
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 32 }}>
      <Serif size={36}>Challenges</Serif>
      <Card style={{ padding: 18, gap: 10, borderColor: 'rgba(247,201,107,0.35)' }}>
        <Label>DAILY CHALLENGE · UTC DAY</Label>
        <Serif size={24}>{done ? 'Completed today' : 'Today’s puzzle'}</Serif>
        <Text style={{ fontFamily: F.body, color: C.sub }}>New puzzle in {left}. Rewards are granted once per day.</Text>
        <Btn primary label={done ? 'Play again (no reward)' : 'Play daily'} onPress={() => go({ mode: 'daily', level: 0 })} />
      </Card>
      <Card style={{ padding: 18, gap: 10 }}>
        <Label>TIME RUSH · LEVEL {Math.min(state.unlocked, 60)}</Label>
        <Text style={{ fontFamily: F.body, color: C.sub }}>Clear the puzzle before time runs out. Score = 1000 + 10 per second left − 5 per move.</Text>
        {RUSH.map(([name, s]) => <Btn key={name} label={`${name} · ${s}s`} onPress={() => go({ mode: 'timed', level: Math.min(state.unlocked, 60), seconds: s })} />)}
        <Text style={{ fontFamily: F.body, color: C.sub, fontSize: 12 }}>Best score on this device: {state.bestScore.toLocaleString()} (unverified)</Text>
      </Card>
    </ScrollView>
  );
}
