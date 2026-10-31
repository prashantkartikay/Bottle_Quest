import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Go } from '../../App';
import Bottle from '../components/Bottle';
import { Btn, Card, Label, Serif } from '../components/ui';
import { dayKey, playerLevel, useStore } from '../store';
import { C, F } from '../theme';

export default function Home({ go }: { go: Go }) {
  const { state } = useStore();
  const saved = state.saved;
  const next = Math.min(state.unlocked, 60);
  const weekAgo = dayKey(new Date(Date.now() - 6 * 86400000));
  const weekCount = state.weekDays.filter((d) => d >= weekAgo).length;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 0 }}>
        <Text style={{ fontFamily: F.serif, fontSize: 21, letterSpacing: 4, color: C.text }}>BOTTLE QUEST</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Card style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99 }}><Text style={{ fontFamily: F.bold, fontSize: 12, color: C.text }}>LV {playerLevel(state.xp)}</Text></Card>
          <Card style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99 }}><Text style={{ fontFamily: F.bold, fontSize: 12, color: C.gold }}>{state.coins.toLocaleString()}</Text></Card>
        </View>
      </View>
      <View style={{ height: 230, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 24, paddingBottom: 20 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Bottle units={[1, 3, 3]} cap={4} w={56} h={150} />
        <View style={{ marginBottom: 16 }}><Bottle units={[0, 0, 2, 2]} cap={4} w={56} h={150} selected /></View>
        <Bottle units={[1, 1, 1]} cap={4} w={56} h={150} />
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text accessibilityRole="header" style={{ fontFamily: F.serif, fontSize: 42, color: C.text }}>Every Drop Counts.</Text>
        <Serif size={20} color={C.gold} italic>Pour. Match. Master.</Serif>
      </View>
      <View style={{ padding: 24, gap: 12 }}>
        <Btn primary label={saved ? `Continue Game · Level ${saved.level}` : `Continue Game · Level ${next}`} style={{ minHeight: 60 }}
          onPress={() => go(saved ? { mode: saved.mode, level: saved.level } : { mode: 'classic', level: next })} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Classic" style={{ flex: 1 }} onPress={() => go({ mode: 'classic', level: next })} />
          <Btn label="Time Rush" style={{ flex: 1 }} onPress={() => go({ mode: 'timed', level: next, seconds: 90 })} />
          <Btn gold label="Daily" style={{ flex: 1 }} onPress={() => go({ mode: 'daily', level: 0 })} />
        </View>
        <Card style={{ padding: 18, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Serif size={20}>{state.streak}-day streak</Serif><Label>WEEKLY {weekCount} / 7</Label>
          </View>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            {Array.from({ length: 7 }).map((_, i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < weekCount ? C.gold : '#3a3052' }} />)}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
