import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { LIQ, NAMES, SYM } from '../theme';

type P = { units: number[]; cap: number; w: number; h: number; selected?: boolean; hint?: boolean; bad?: boolean; index?: number; onPress?: () => void };
export default function Bottle({ units, cap, w, h, selected, hint, bad, index, onPress }: P) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(y, { toValue: selected ? -16 : 0, useNativeDriver: true, friction: 7 }).start(); }, [selected, y]);
  const segH = (h - 9) / cap;
  const label = `Bottle ${(index ?? 0) + 1}: ${units.length ? units.map((c) => NAMES[c]).join(', ') + ' from bottom' : 'empty'}${selected ? ', selected' : ''}`;
  const edge = bad ? '#E8718A' : selected || hint ? '#C4B2FF' : 'rgba(250,247,255,0.3)';
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Animated.View style={{ transform: [{ translateY: y }], shadowColor: '#A78BFA', shadowOpacity: selected || hint ? 0.7 : 0, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: selected ? 8 : 0 }}>
        <View style={{ width: w, height: h, borderWidth: 1.5, borderTopWidth: 0, borderColor: edge, borderBottomLeftRadius: w / 2, borderBottomRightRadius: w / 2, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden', padding: 4, paddingBottom: 5, flexDirection: 'column-reverse', gap: 1 }}>
          {units.map((c, i) => (
            <View key={i} style={{ height: segH, borderRadius: 4, borderBottomLeftRadius: i === 0 ? w / 2 : 4, borderBottomRightRadius: i === 0 ? w / 2 : 4, backgroundColor: LIQ[c], alignItems: 'center', justifyContent: 'center' }}>
              <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', backgroundColor: 'rgba(255,255,255,0.18)' }} />
              <Text style={{ fontSize: Math.min(12, w / 5), color: 'rgba(16,13,32,0.55)' }}>{SYM[c]}</Text>
            </View>
          ))}
          <View pointerEvents="none" style={{ position: 'absolute', left: 8, top: 12, width: 3, height: '60%', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' }} />
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </View>
      </Animated.View>
    </Pressable>
  );
}
