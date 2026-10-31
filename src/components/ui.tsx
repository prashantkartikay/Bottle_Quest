import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { C, F } from '../theme';

export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ backgroundColor: 'rgba(32,25,52,0.9)', borderWidth: 1, borderColor: C.line, borderRadius: 20 }, style]}>{children}</View>
);
export function Btn({ label, onPress, primary, gold, disabled, style }: { label: string; onPress: () => void; primary?: boolean; gold?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [{ minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, opacity: disabled ? 0.4 : pressed ? 0.85 : 1, backgroundColor: primary ? '#A78BFA' : C.card, borderWidth: primary ? 0 : 1, borderColor: gold ? 'rgba(247,201,107,0.45)' : C.line }, style]}>
      <Text style={{ fontFamily: F.bold, fontSize: 14, color: primary ? C.bg : gold ? C.gold : C.text }}>{label}</Text>
    </Pressable>
  );
}
export const Label = ({ children }: { children: React.ReactNode }) => <Text style={{ fontFamily: F.bold, fontSize: 11, letterSpacing: 1.4, color: C.sub }}>{children}</Text>;
export const Serif = ({ children, size = 28, color = C.text, italic }: { children: React.ReactNode; size?: number; color?: string; italic?: boolean }) => (
  <Text style={{ fontFamily: italic ? F.serifI : F.serif, fontSize: size, color }}>{children}</Text>
);
