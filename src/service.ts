// MOCK API LAYER. There is no backend in this project. Replace the body of fetchLeaderboard with
//   GET /api/v1/leaderboards/{global|friends} and GET /api/v1/challenges/:id/leaderboard
// Scores below are sample data. Local scores are never ranked here because they are not server-verified.
export type Scope = 'daily' | 'weekly' | 'all' | 'friends';
export interface Entry { rank: number; name: string; score: number }
const NAMES = ['Mira', 'Noor', 'Jonas', 'Aiko', 'Leo', 'Sana', 'Tomas', 'Ira', 'Kofi', 'Elin'];
export async function fetchLeaderboard(scope: Scope): Promise<Entry[]> {
  const base = { daily: 3120, weekly: 9840, all: 48210, friends: 2210 }[scope];
  await new Promise((r) => setTimeout(r, 250));
  return NAMES.slice(0, scope === 'friends' ? 5 : 10).map((name, i) => ({ rank: i + 1, name, score: Math.round(base - i * base * 0.045) }));
}
