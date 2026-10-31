/**
 * AdMob rewarded ads for Bottle Quest.
 * Development always uses Google's test rewarded unit. Production builds use
 * the supplied live unit ID. Never click your own live ads during testing.
 * Complete consent/privacy and store review requirements before release.
 */
import mobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

export const AD_TEST_MODE = __DEV__;

const LIVE_REWARDED_HINT_UNIT_ID = 'ca-app-pub-5956206554446103/6656010788';
// Use Google's official test unit in development to protect the AdMob account.
export const REWARDED_HINT_UNIT_ID = AD_TEST_MODE
  ? TestIds.REWARDED
  : LIVE_REWARDED_HINT_UNIT_ID;

let initPromise: Promise<unknown> | null = null;

export function initializeAds(): Promise<unknown> {
  if (!initPromise) {
    initPromise = mobileAds().initialize().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

/**
 * Shows a rewarded ad and resolves true only if the SDK emits EARNED_REWARD.
 * A no-fill/load/show/close-without-reward resolves false.
 */
export async function showRewardedHintAd(): Promise<boolean> {
  try {
    await initializeAds();
    return await new Promise<boolean>((resolve) => {
      const ad = RewardedAd.createForAdRequest(REWARDED_HINT_UNIT_ID);
      let settled = false;
      let earned = false;
      let opened = false;
      let subscriptions: Array<{ remove: () => void }> = [];

      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        subscriptions.forEach((sub) => sub.remove());
        subscriptions = [];
        resolve(value);
      };

      subscriptions.push(
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        ad.addAdEventListener(AdEventType.LOADED, () => {
          opened = true;
          ad.show().catch(() => finish(false));
        }),
        ad.addAdEventListener(AdEventType.ERROR, () => finish(false)),
        ad.addAdEventListener(AdEventType.CLOSED, () => finish(earned)),
      );

      // Guard native bridge errors too.
      try {
        ad.load();
      } catch {
        finish(false);
      }

      // No timer-based timeout: SDK load/error callbacks own completion.
      void opened;
    });
  } catch {
    return false;
  }
}
