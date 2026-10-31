# Bottle Quest (React Native / Expo)

Run: `npm install && npx expo start` (press i / a, or scan with Expo Go). Tests: `npm test`. Types: `npm run typecheck`.

## What is implemented
- Home, Levels (60 solver-verified levels), Challenges (Time Rush 120/90/60s, Daily), Leaderboard, Profile, Pause and Result screens.
- `src/engine.ts`: pure immutable rules (pour, undo, restart, win, BFS/DFS solver for hints and par). No React imports, so it can be reused on a backend.
- Classic and Daily have no timer. Time Rush has a pausable countdown.
- Progress (levels, stars, best moves, coins, XP, streak, saved game) persists with AsyncStorage. Daily rewards are granted once per UTC day.
- Hints: one free per level, then 20 coins. Symbols on every color. Haptics toggle. Accessibility labels on bottles and buttons.

## What is NOT implemented (be aware)
- No backend, auth, database or real leaderboard. `src/service.ts` is a mock returning sample data; local scores are labelled unverified and never ranked.
- Time Rush timing and scores are client-side. A real build needs the server to own start time and re-run the move list through `engine.ts`.
- No Endless mode, achievements, analytics, sound, or liquid pour animation (bottles lift on select).


## Ads integration (pre-publication preparation)

This project now includes an **AdMob rewarded-ad test flow** for an extra puzzle hint:
- `src/ads.ts` initializes Google Mobile Ads on the first rewarded request and uses the official Google rewarded test unit ID.
- The Play screen includes **Watch ad for an extra hint**. It grants a highlighted hint only after the SDK reports `EARNED_REWARD`.
- If an ad fails or closes without reward, gameplay continues and no reward is granted.
- `app.json` contains Google's Android/iOS **sample App IDs**, not your production IDs.
- `package.json` adds `react-native-google-mobile-ads@14.7.2` and Expo development-client support. This version choice is intended for the project's Expo 51 / React Native 0.74 baseline; verify compatibility by installing and building in your own toolchain.

### Run it
1. Install dependencies: `npm install`.
2. Create a native development build (Expo Go does not include this native SDK):
   - Local Android: `npx expo run:android`
   - Or configure EAS and run a development build.
3. Install the generated app on a real Android device or compatible emulator and test the rewarded hint using Google's test inventory.

### Before production or enabling live Meta demand
Do **not** ship the current sample IDs as a monetized production configuration.
1. Complete an applicable consent/privacy flow (Google UMP and any required regional disclosures) **before initializing/requesting ads**. The current scaffold does not yet implement consent collection and is for development/testing only.
2. In AdMob, use your real Android App ID and create a rewarded ad unit; update the `react-native-google-mobile-ads` config plugin and `REWARDED_HINT_UNIT_ID`.
3. Register Bottle Quest in Meta Monetization Manager when the required valid store URL/listing is available and Meta allows the submission. Complete its review and payout/eligibility requirements.
4. Configure Meta Audience Network as a bidding source in AdMob Mediation and map Meta's placement ID to the AdMob rewarded ad unit.
5. Add the Meta mediation adapter package that is compatible with the selected core SDK version, then rebuild. Meta has not been added to this binary yet because the app is not registered and the placement/mediation setup is not available.
6. Add Meta to relevant consent/privacy partner lists, implement required platform privacy declarations, and verify using the mediation test tools and adapter status.
7. Remove/disable any development-only behavior and verify store policy, Data safety, privacy policy, ads disclosures, target SDK, and testing requirements.

### Current status and limitations
- **Implemented:** AdMob SDK integration foundation and a rewarded hint test placement.
- **Not implemented yet:** Meta Audience Network demand/adapter, production ad IDs, consent UI, interstitial ads, and live monetization validation.
- Ads require a native development/release build; Expo Go will not work.
- An ad impression or download does not guarantee revenue. Never click your own ads.
