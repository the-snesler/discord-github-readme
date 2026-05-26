export type Theme =
  | 'dark'
  | 'light'
  | 'nitroDark'
  | 'nitroLight'
  | 'custom'
  | 'catppuccinMocha'
  | 'catppuccinLatte'
  | 'catppuccinFrappe'
  | 'dracula'
  | 'nord'
  | 'tokyoNight'
  | 'githubDark'
  | 'gruvbox'
  | 'solarized';

export type Font =
  | 'ggsans'
  | 'tempo'
  | 'sakura'
  | 'jellybean'
  | 'modern'
  | 'medieval'
  | '8bit'
  | 'vampyre';

export type Effect = 'solid' | 'gradient' | 'neon' | 'toon' | 'pop';

export interface NitroColors {
  primary: string;
  accent: string;
}

export interface CustomColors {
  b1: string;
  b2: string;
  b3: string;
  t1: string;
  t2: string;
}

export interface PreviewState {
  userId: string;
  enableAboutMe: boolean;
  aboutMe: string;
  enableDecoration: boolean;
  enableSpotify: boolean;
  theme: Theme;
  nitroColors: NitroColors;
  customColors: CustomColors;
  pronouns: string;
  width: string;
  overrideBanner: boolean;
  bannerUrl: string;
  bannerColor: string;
  font: Font;
  effect: Effect;
  nameColor1: string;
  nameColor2: string;
}

const stripHash = (c: string) => c.replace(/^#/, '');

export type Layout = 'standard' | 'compact' | 'badge';

export function buildPreviewUrl(state: PreviewState, layout: Layout = 'standard'): string {
  const params = new URLSearchParams();

  if (state.enableAboutMe && state.aboutMe) {
    params.append('aboutMe', state.aboutMe);
  }
  if (state.pronouns) {
    params.append('pronouns', state.pronouns);
  }
  if (state.overrideBanner && state.bannerUrl) {
    params.append('banner', state.bannerUrl);
  } else if (state.overrideBanner && state.bannerColor) {
    params.append('bannerColor', stripHash(state.bannerColor));
  }
  if (!state.enableDecoration) {
    params.append('hideDecoration', 'true');
  }
  if (!state.enableSpotify) {
    params.append('hideSpotify', 'true');
  }

  params.append('theme', state.theme);

  if (state.theme === 'nitroDark' || state.theme === 'nitroLight') {
    params.append('primaryColor', stripHash(state.nitroColors.primary));
    params.append('accentColor', stripHash(state.nitroColors.accent));
  } else if (state.theme === 'custom') {
    params.append('colorB1', stripHash(state.customColors.b1));
    params.append('colorB2', stripHash(state.customColors.b2));
    params.append('colorB3', stripHash(state.customColors.b3));
    params.append('colorT1', stripHash(state.customColors.t1));
    params.append('colorT2', stripHash(state.customColors.t2));
  }

  if (state.width) {
    params.append('width', state.width.toString());
  }

  if (state.font && state.font !== 'ggsans') {
    params.append('font', state.font);
  }
  if (state.effect && state.effect !== 'solid') {
    params.append('effect', state.effect);
  }
  if (state.nameColor1) {
    params.append('nameColor1', stripHash(state.nameColor1));
  }
  if (state.effect === 'gradient' && state.nameColor2) {
    params.append('nameColor2', stripHash(state.nameColor2));
  }

  if (layout !== 'standard') {
    params.append('layout', layout);
  }

  const base = `/api/user/${state.userId}`;
  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}
