let initialized = false;

export const initOneSignal = (appId: string) => {
  if (typeof window === 'undefined') return;
  if (initialized) return;
  if (!appId) return;

  initialized = true;

  const OneSignal = (window as any).OneSignalDeferred || [];
  (window as any).OneSignalDeferred = OneSignal;

  OneSignal.push(async function (OneSignal: any) {
    await OneSignal.init({ appId });
  });
};

export const promptNotificationPermission = () => {
  if (typeof window === 'undefined') return;
  const OneSignal = (window as any).OneSignal;
  if (!OneSignal) return;

  try {
    OneSignal.Slidedown?.promptPush();
  } catch {
    // silently fail
  }
};
