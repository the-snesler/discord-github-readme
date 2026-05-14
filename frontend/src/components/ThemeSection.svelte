<script lang="ts">
  import ColorInput from './ColorInput.svelte';
  import type { Theme, NitroColors, CustomColors } from '../lib/buildPreviewUrl';

  interface Props {
    theme: Theme;
    setTheme: (t: Theme) => void;
    nitroColors: NitroColors;
    setNitroColors: (c: NitroColors) => void;
    customColors: CustomColors;
    setCustomColors: (c: CustomColors) => void;
  }

  const {
    theme,
    setTheme,
    nitroColors,
    setNitroColors,
    customColors,
    setCustomColors,
  }: Props = $props();

  // Tiles map roughly to the rows shown in the mockup. Each swatch is a
  // 135deg gradient from the theme's accent → background so they read
  // recognizably at small sizes.
  type Tile = { value: Theme; label: string; primary: string, background: string };
  const tiles: Tile[] = [
    { value: 'dark', label: 'Dark', primary: '#5865f2', background: '#313338' },
    { value: 'light', label: 'Light', primary: '#5865f2', background: '#f2f3f5' },
    { value: 'nitroDark', label: 'Nitro Dark', primary: '#5865f2', background: 'linear-gradient(#6757a7 0%, #633951 100%)' },
    { value: 'nitroLight', label: 'Nitro Light', primary: '#5865f2', background: 'linear-gradient(#9582ff 0%, #fcd3ea 100%)' },
    { value: 'catppuccinMocha', label: 'Mocha', primary: '#cba6f7', background: '#1e1e2e' },
    { value: 'dracula', label: 'Dracula', primary: '#ff79c6', background: '#282a36' },
    { value: 'nord', label: 'Nord', primary: '#88c0d0', background: '#2e3440' },
    { value: 'tokyoNight', label: 'Tokyo Night', primary: '#7aa2f7', background: '#1a1b26' },
    { value: 'githubDark', label: 'GitHub', primary: '#58a6ff', background: '#0d1117' },
    { value: 'gruvbox', label: 'Gruvbox', primary: '#fabd2f', background: '#282828' },
    { value: 'solarized', label: 'Solar', primary: '#b58900', background: '#002b36' },
    { value: 'catppuccinLatte', label: 'Latte', primary: '#8839ef', background: '#eff1f5' },
    { value: 'catppuccinFrappe', label: 'Frappé', primary: '#ca9ee6', background: '#303446' },
    { value: 'custom', label: 'Custom', primary: '#f472b6', background: '#a78bfa' },
  ];

  const showNitro = $derived(theme === 'nitroDark' || theme === 'nitroLight');
  const showCustom = $derived(theme === 'custom');
</script>

<div>
  <div class="flex items-baseline justify-between mb-3">
    <span class="text-[13px] font-semibold">Theme</span>
  </div>

  <div class="grid grid-cols-4 gap-2">
    {#each tiles as t (t.value)}
      <button
        type="button"
        onclick={() => setTheme(t.value)}
        class="theme-tile {theme === t.value ? 'selected' : ''}"
        aria-pressed={theme === t.value}
      >
        <div class="rounded-sm border border-white/10 p-2 flex gap-1" style:background={t.background}>
          <div class="rounded-full w-5 h-5" style:background={t.primary}></div>
          <div class="flex flex-col flex-1 gap-0.5">
            <div class="rounded-full h-2 w-3/4 bg-neutral-500/50"></div>
            <div class="rounded-full w-full h-1.5 bg-neutral-500/20"></div>
          </div>
        </div>
        <div class="label">{t.label}</div>
      </button>
    {/each}
  </div>

  {#if showNitro}
    <div class="mt-4">
      <div class="text-[12px] text-ink-mute mb-2">Nitro colors</div>
      <div class="flex flex-wrap">
        <ColorInput
          value={nitroColors.primary}
          onChange={(v) => setNitroColors({ ...nitroColors, primary: v })}
        />
        <ColorInput
          value={nitroColors.accent}
          onChange={(v) => setNitroColors({ ...nitroColors, accent: v })}
        />
      </div>
    </div>
  {/if}

  {#if showCustom}
    <div class="mt-4">
      <div class="text-[12px] text-ink-mute mb-2">Custom colors</div>
      <div class="flex flex-wrap">
        <ColorInput
          value={customColors.b1}
          onChange={(v) => setCustomColors({ ...customColors, b1: v })}
        />
        <ColorInput
          value={customColors.b2}
          onChange={(v) => setCustomColors({ ...customColors, b2: v })}
        />
        <ColorInput
          value={customColors.b3}
          onChange={(v) => setCustomColors({ ...customColors, b3: v })}
        />
        <ColorInput
          value={customColors.t1}
          onChange={(v) => setCustomColors({ ...customColors, t1: v })}
        />
        <ColorInput
          value={customColors.t2}
          onChange={(v) => setCustomColors({ ...customColors, t2: v })}
        />
      </div>
    </div>
  {/if}
</div>
