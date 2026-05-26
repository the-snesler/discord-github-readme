<script lang="ts">
  import ColorInput from "./ColorInput.svelte";
  import type { Font, Effect } from "../lib/buildPreviewUrl";

  interface Props {
    font: Font;
    setFont: (f: Font) => void;
    effect: Effect;
    setEffect: (e: Effect) => void;
    nameColor1: string;
    setNameColor1: (c: string) => void;
    nameColor2: string;
    setNameColor2: (c: string) => void;
  }

  const {
    font,
    setFont,
    effect,
    setEffect,
    nameColor1,
    setNameColor1,
    nameColor2,
    setNameColor2,
  }: Props = $props();

  type FontTile = { value: Font; label: string; family: string };
  const fontTiles: FontTile[] = [
    { value: "ggsans", label: "Default", family: "'GG Sans', sans-serif" },
    { value: "tempo", label: "Tempo", family: "'Zilla Slab', serif" },
    { value: "sakura", label: "Sakura", family: "'Cherry Bomb One', cursive" },
    { value: "jellybean", label: "Jellybean", family: "'Chicle', cursive" },
    { value: "modern", label: "Modern", family: "'MuseoModerno', sans-serif" },
    { value: "medieval", label: "Medieval", family: "'Neo-castel', serif" },
    { value: "8bit", label: "8-Bit", family: "'Pixelify Sans', monospace" },
    { value: "vampyre", label: "Vampyre", family: "'Sinistre', serif" },
  ];

  type EffectPill = { value: Effect; label: string };
  const effectPills: EffectPill[] = [
    { value: "solid", label: "Solid" },
    { value: "gradient", label: "Gradient" },
    { value: "neon", label: "Neon" },
    { value: "toon", label: "Toon" },
    { value: "pop", label: "Pop" },
  ];

  // Discord-ish preset palette (single-color effects)
  const soloPresets = [
    "#ffffff",
    "#22d3ee",
    "#3b82f6",
    "#a78bfa",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#facc15",
  ];

  // Gradient preset pairs (Discord's modal shows 6 pairs in 2 cols × 3 rows)
  const gradientPresets: Array<[string, string]> = [
    ["#a78bfa", "#ec4899"],
    ["#22d3ee", "#3b82f6"],
    ["#facc15", "#f97316"],
    ["#34d399", "#22d3ee"],
    ["#ef4444", "#facc15"],
    ["#ec4899", "#f97316"],
  ];

  const previewColor = $derived(nameColor1 || "#ffffff");
  const previewColor2 = $derived(nameColor2 || "#ffffff");

  function effectPreviewStyle(e: Effect): string {
    if (e === "gradient") {
      return `background: linear-gradient(90deg, ${previewColor} 0%, ${previewColor2} 100%); -webkit-background-clip: text; background-clip: text; color: transparent;`;
    }
    if (e === "neon") {
      return `color: #fff; text-shadow: 0 0 6px ${previewColor}, 0 0 12px ${previewColor};`;
    }
    if (e === "toon") {
      return `color: #fff; -webkit-text-stroke: 2px ${previewColor};`;
    }
    if (e === "pop") {
      return `color: #fff; -webkit-text-stroke: 1px #000; text-shadow: 2px 3px 0 ${previewColor};`;
    }
    return `color: ${previewColor};`;
  }
</script>

<!-- Font-face declarations for the picker tiles (full woff2, served statically) -->
<svelte:head>
  <style>
    @font-face { font-family: 'Zilla Slab'; src: url('/fonts/tempo.woff2') format('woff2'); font-display: swap; }
    @font-face { font-family: 'Cherry Bomb One'; src: url('/fonts/sakura.woff2') format('woff2'); font-display: swap; }
    @font-face { font-family: 'Chicle'; src: url('/fonts/jellybean.woff2') format('woff2'); font-display: swap; }
    @font-face { font-family: 'MuseoModerno'; src: url('/fonts/modern.woff2') format('woff2'); font-display: swap; }
    @font-face { font-family: 'Neo-castel'; src: url('/fonts/medieval.woff2') format('woff2'); font-display: swap; }
    @font-face { font-family: 'Pixelify Sans'; src: url('/fonts/8bit.woff2') format('woff2'); font-display: swap; }
    @font-face { font-family: 'Sinistre'; src: url('/fonts/vampyre.woff2') format('woff2'); font-display: swap; }
  </style>
</svelte:head>

<div>
  <div class="text-[13px] font-semibold mb-3">Display name style</div>

  <div class="eyebrow text-[10px] mb-2">Choose Font</div>
  <div class="grid grid-cols-4 gap-2 mb-5">
    {#each fontTiles as t (t.value)}
      <button
        type="button"
        onclick={() => setFont(t.value)}
        class="font-tile {font === t.value ? 'selected' : ''}"
        aria-pressed={font === t.value}
        aria-label={t.label}
        title={t.label}
      >
        <span class="glyph" style:font-family={t.family}>Gg</span>
      </button>
    {/each}
  </div>

  <div class="eyebrow text-[10px] mb-2">Choose Effect</div>
  <div class="flex flex-wrap gap-2 mb-5">
    {#each effectPills as p (p.value)}
      <button
        type="button"
        onclick={() => setEffect(p.value)}
        class="effect-pill {effect === p.value ? 'selected' : ''}"
        aria-pressed={effect === p.value}
      >
        <span style={effectPreviewStyle(p.value)}>{p.label}</span>
      </button>
    {/each}
  </div>

  <div class="eyebrow text-[10px] mb-2">Choose Color</div>
  {#if effect === "gradient"}
    <div class="grid grid-cols-2 gap-2 mb-3">
      {#each gradientPresets as [c1, c2] (c1 + c2)}
        <button
          type="button"
          onclick={() => {
            setNameColor1(c1);
            setNameColor2(c2);
          }}
          class="gradient-swatch {nameColor1 === c1 && nameColor2 === c2 ? 'selected' : ''}"
          style:background={`linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`}
          aria-label={`Gradient ${c1} to ${c2}`}
        ></button>
      {/each}
    </div>
    <div class="flex items-center gap-2">
      <ColorInput value={nameColor1 || "#a78bfa"} onChange={(v) => setNameColor1(v)} />
      <ColorInput value={nameColor2 || "#ec4899"} onChange={(v) => setNameColor2(v)} />
      <span class="text-[12px] text-ink-mute">Custom from / to</span>
    </div>
  {:else}
    <div class="flex flex-wrap gap-2 mb-3">
      {#each soloPresets as c (c)}
        <button
          type="button"
          onclick={() => setNameColor1(c)}
          class="solo-swatch {nameColor1?.toLowerCase() === c ? 'selected' : ''}"
          style:background={c}
          aria-label={c}
        ></button>
      {/each}
    </div>
    <div class="flex items-center gap-2">
      <ColorInput value={nameColor1 || "#ffffff"} onChange={(v) => setNameColor1(v)} />
      <span class="text-[12px] text-ink-mute">Custom color</span>
    </div>
  {/if}
</div>

<style>
  .font-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: background 120ms, border-color 120ms, transform 120ms;
  }
  .font-tile:hover { background: rgba(255, 255, 255, 0.07); }
  .font-tile.selected {
    background: rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.6);
  }
  .font-tile .glyph {
    font-size: 22px;
    line-height: 1;
    color: var(--color-ink);
  }

  .effect-pill {
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms, border-color 120ms;
  }
  .effect-pill:hover { background: rgba(255, 255, 255, 0.08); }
  .effect-pill.selected {
    background: rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.6);
  }

  .solo-swatch,
  .gradient-swatch {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: transform 120ms, border-color 120ms;
  }
  .gradient-swatch {
    width: 100%;
    height: 36px;
  }
  .solo-swatch:hover,
  .gradient-swatch:hover { transform: scale(1.05); }
  .solo-swatch.selected,
  .gradient-swatch.selected {
    border-color: var(--color-brand-purple);
    box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
  }
</style>
