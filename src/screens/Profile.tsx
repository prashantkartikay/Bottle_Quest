import React from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { Btn, Card, Label, Serif } from '../components/ui';
import { INIT, playerLevel, useStore } from '../store';
import { C, F } from '../theme';

export default function Profile() {
  const { state, update } = useStore();
  const lvl = playerLevel(state.xp), into = state.xp % 100;
  const totalStars = Object.values(state.stars).reduce((a, b) => a + b, 0);
  const stats: [string, string][] = [['COINS', state.coins.toLocaleString()], ['STARS', String(totalStars)], ['LEVELS CLEARED', String(Object.keys(state.stars).filter((k) => k[0] === 'L').length)], ['STREAK', `${state.streak} days`]];
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 32 }}>
      <Serif size={36}>Profile</Serif>
      <Card style={{ padding: 18, gap: 10 }}>
        <Serif size={26}>Level {lvl}</Serif>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: '#3a3052' }}><View style={{ width: `${into}%`, height: 6, borderRadius: 3, backgroundColor: C.aqua }} /></View>
        <Label>{into} / 100 XP</Label>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map(([k, v]) => <Card key={k} style={{ width: '48%', padding: 16, gap: 4 }}><Label>{k}</Label><Serif size={26}>{v}</Serif></Card>)}
      </View>
      <Card style={{ padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: C.text, fontFamily: F.bold }}>Haptics</Text>
        <Switch value={state.haptics} onValueChange={(v) => update((s) => ({ ...s, haptics: v }))} trackColor={{ true: C.accent, false: '#3a3052' }} accessibilityLabel="Haptics" />
      </Card>
      <Btn label="Reset all progress" onPress={() => Alert.alert('Reset progress?', 'This clears levels, coins and streak on this device.', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive', onPress: () => update(() => INIT) }])} />
    </ScrollView>
  );
}
