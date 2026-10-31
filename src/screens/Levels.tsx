import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Go } from '../../App';
import { MAX_LEVEL } from '../levels';
import { useStore } from '../store';
import { C, F } from '../theme';
import { Serif } from '../components/ui';

export default function Levels({ go }: { go: Go }) {
  const { state } = useStore();
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
      <Serif size={36}>Levels</Serif>
      <Text style={{ fontFamily: F.body, color: C.sub, marginTop: 4, marginBottom: 18 }}>Classic mode · no timer</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {Array.from({ length: MAX_LEVEL }).map((_, i) => {
          const n = i + 1, open = n <= state.unlocked, st = state.stars[`L${n}`] ?? 0;
          return (
            <Pressable key={n} disabled={!open} onPress={() => go({ mode: 'classic', level: n })} accessibilityRole="button"
              accessibilityLabel={open ? `Level ${n}, ${st} of 3 stars` : `Level ${n}, locked`}
              style={{ width: '22%', aspectRatio: 1, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: n === state.unlocked ? C.accent : C.line, alignItems: 'center', justifyContent: 'center', opacity: open ? 1 : 0.4 }}>
              <Text style={{ fontFamily: F.serif, fontSize: 24, color: C.text }}>{open ? n : '–'}</Text>
              <Text style={{ fontSize: 10, color: C.gold }}>{open ? '★'.repeat(st) + '☆'.repeat(3 - st) : ''}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
