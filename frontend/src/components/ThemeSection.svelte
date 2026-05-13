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

  const themes: Array<{ value: Theme; label: string }> = [
    { value: 'dark', label: 'Dark (default)' },
    { value: 'light', label: 'Light' },
    { value: 'nitroDark', label: 'Nitro Dark' },
    { value: 'nitroLight', label: 'Nitro Light' },
    { value: 'custom', label: 'Custom' },
  ];

  const namedThemes: Array<{ value: Theme; label: string }> = [
    { value: 'catppuccinMocha', label: 'Catppuccin Mocha' },
    { value: 'catppuccinLatte', label: 'Catppuccin Latte' },
    { value: 'catppuccinFrappe', label: 'Catppuccin Frappé' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'nord', label: 'Nord' },
    { value: 'tokyoNight', label: 'Tokyo Night' },
    { value: 'githubDark', label: 'GitHub Dark' },
    { value: 'gruvbox', label: 'Gruvbox' },
    { value: 'solarized', label: 'Solarized' },
  ];

  const showNitro = $derived(theme === 'nitroDark' || theme === 'nitroLight');
  const showCustom = $derived(theme === 'custom');
</script>

<div class="mb-6">
  <span class="block mb-2 font-semibold text-discord-text-muted text-sm">Theme</span>

  <div class="mb-4">
    {#each themes as t (t.value)}
      <div class="flex items-center mb-3">
        <input
          type="radio"
          id={t.value + 'Theme'}
          name="themeType"
          value={t.value}
          checked={theme === t.value}
          onchange={() => setTheme(t.value)}
          class="w-[18px] h-[18px] mr-2.5 cursor-pointer accent-discord-primary"
        />
        <label for={t.value + 'Theme'} class="cursor-pointer">{t.label}</label>
      </div>
    {/each}

    <hr class="my-4 border-discord-border" />

    {#each namedThemes as t (t.value)}
      <div class="flex items-center mb-3">
        <input
          type="radio"
          id={t.value + 'Theme'}
          name="themeType"
          value={t.value}
          checked={theme === t.value}
          onchange={() => setTheme(t.value)}
          class="w-[18px] h-[18px] mr-2.5 cursor-pointer accent-discord-primary"
        />
        <label for={t.value + 'Theme'} class="cursor-pointer">{t.label}</label>
      </div>
    {/each}
  </div>

  {#if showNitro}
    <div class="mb-4">
      <span class="block mb-2 font-semibold text-discord-text-muted text-sm">Nitro Colors</span>
      <ColorInput
        value={nitroColors.primary}
        onChange={(v) => setNitroColors({ ...nitroColors, primary: v })}
      />
      <ColorInput
        value={nitroColors.accent}
        onChange={(v) => setNitroColors({ ...nitroColors, accent: v })}
      />
    </div>
  {/if}

  {#if showCustom}
    <div class="mb-4">
      <span class="block mb-2 font-semibold text-discord-text-muted text-sm">Custom Colors</span>
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
  {/if}
</div>
