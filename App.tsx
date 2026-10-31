import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { CormorantGaramond_700Bold, CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond';
import { StoreProvider } from './src/store';
import { Mode } from './src/store';
import { C, F } from './src/theme';
import Home from './src/screens/Home';
import Levels from './src/screens/Levels';
import Challenges from './src/screens/Challenges';
import Ranks from './src/screens/Ranks';
import Profile from './src/screens/Profile';
import Play from './src/screens/Play';

export type Route = { mode: Mode; level: number; seconds?: number; nonce: number };
export type Go = (r: Omit<Route, 'nonce'>) => void;
const TABS = [['home', 'HOME'], ['levels', 'PLAY'], ['challenges', 'CHALLENGES'], ['ranks', 'RANKS'], ['profile', 'PROFILE']] as const;
type Tab = (typeof TABS)[number][0];

function Root() {
  const [tab, setTab] = useState<Tab>('home');
  const [route, setRoute] = useState<Route | null>(null);
  const go: Go = (r) => setRoute({ ...r, nonce: Date.now() });
  if (route) return <Play key={route.nonce} route={route} go={go} onExit={() => setRoute(null)} />;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <Home go={go} />}
        {tab === 'levels' && <Levels go={go} />}
        {tab === 'challenges' && <Challenges go={go} />}
        {tab === 'ranks' && <Ranks />}
        {tab === 'profile' && <Profile />}
      </View>
      <View accessibilityRole="tablist" style={{ height: 68, backgroundColor: '#141026', borderTopWidth: 1, borderTopColor: 'rgba(247,201,107,0.18)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        {TABS.map(([k, label]) => (
          <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} accessibilityLabel={label} style={{ minHeight: 48, minWidth: 56, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: F.bold, fontSize: 10.5, letterSpacing: 0.8, color: tab === k ? C.gold : C.sub }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
export default function App() {
  const [ok] = useFonts({ Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold, CormorantGaramond_700Bold, CormorantGaramond_500Medium_Italic });
  if (!ok) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <StoreProvider><Root /></StoreProvider>
    </SafeAreaProvider>
  );
}
