import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Btn, Card, Label, Serif } from '../components/ui';
import { Entry, fetchLeaderboard, Scope } from '../service';
import { useStore } from '../store';
import { C, F } from '../theme';

const TABS: [Scope, string][] = [['daily', 'Daily'], ['weekly', 'Weekly'], ['all', 'All Time'], ['friends', 'Friends']];
export default function Ranks() {
  const { state } = useStore();
  const [scope, setScope] = useState<Scope>('daily');
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [err, setErr] = useState(false);
  const load = useCallback(() => { setRows(null); setErr(false); fetchLeaderboard(scope).then(setRows).catch(() => setErr(true)); }, [scope]);
  useEffect(load, [load]);
  const top = rows?.slice(0, 3) ?? [], rest = rows?.slice(3) ?? [];
  const ring = ['#F7C96B', '#C9C3DA', '#C98F6B'];
  const order = [1, 0, 2];
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32, gap: 8 }}>
      <Serif size={36}>Leaderboard</Serif>
      <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
        {TABS.map(([k, label]) => (
          <Pressable key={k} onPress={() => setScope(k)} accessibilityRole="button" accessibilityState={{ selected: scope === k }}
            style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 99, justifyContent: 'center', backgroundColor: scope === k ? C.accent : C.card }}>
            <Text style={{ fontFamily: F.bold, fontSize: 12, color: scope === k ? C.bg : C.sub }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {err && <Card style={{ padding: 18, gap: 10 }}><Text style={{ color: C.text, fontFamily: F.bold }}>Couldn’t load the leaderboard</Text><Btn label="Retry" onPress={load} /></Card>}
      {!rows && !err && <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />}
      {rows && rows.length === 0 && <Text style={{ color: C.sub, fontFamily: F.body }}>No scores yet. Finish a puzzle to start the board.</Text>}
      {rows && rows.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          {order.map((i) => top[i] && (
            <View key={i} style={{ width: i === 0 ? 106 : 94, alignItems: 'center' }}>
              <View style={{ width: i === 0 ? 66 : 52, aspectRatio: 1, borderRadius: 40, borderWidth: 2, borderColor: ring[i], backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Text style={{ fontFamily: F.black, color: C.text, fontSize: i === 0 ? 20 : 16 }}>{top[i].name[0]}</Text>
              </View>
              <Text style={{ color: C.text, fontFamily: F.bold, fontSize: 13 }}>{top[i].name}</Text>
              <Text style={{ color: i === 0 ? C.gold : C.sub, fontFamily: F.body, fontSize: 13 }}>{top[i].score.toLocaleString()}</Text>
              <Card style={{ marginTop: 8, width: '100%', height: [92, 60, 44][i], borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Serif size={i === 0 ? 34 : 26} color={i === 0 ? C.gold : C.text}>{String(i + 1)}</Serif>
              </Card>
            </View>
          ))}
        </View>
      )}
      {rest.map((r) => (
        <Card key={r.rank} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16 }}>
          <Serif size={20} color={C.sub}>{String(r.rank)}</Serif>
          <Text style={{ flex: 1, color: C.text, fontFamily: F.body }}>{r.name}</Text>
          <Text style={{ color: C.text, fontFamily: F.bold }}>{r.score.toLocaleString()}</Text>
        </Card>
      ))}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, backgroundColor: C.card2, borderColor: C.accent, borderWidth: 1.5 }}>
        <Serif size={20} color={C.gold}>You</Serif>
        <Text style={{ flex: 1, color: C.sub, fontFamily: F.body, fontSize: 12 }}>Local best · not server-verified, so not ranked</Text>
        <Text style={{ color: C.text, fontFamily: F.bold }}>{state.bestScore.toLocaleString()}</Text>
      </Card>
      <Label>SAMPLE DATA · MOCK SERVICE LAYER</Label>
    </ScrollView>
  );
}
