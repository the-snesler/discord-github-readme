export interface RuntimeConfig {
  defaultUserName: string;
  defaultUserId: string;
  inviteUrl: string;
}

declare global {
  interface Window {
    __CONFIG__?: RuntimeConfig;
  }
}

export function getConfig(): RuntimeConfig {
  if (typeof window === "undefined" || !window.__CONFIG__) {
    // SSR path or pre-hydration: render with empty defaults; the hydrated
    // component will pick up real values on the client.
    return { defaultUserName: "", defaultUserId: "", inviteUrl: "" };
  }
  return window.__CONFIG__;
}
