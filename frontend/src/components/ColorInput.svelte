<script lang="ts">
  import { hexToHsv, hsvToHex } from '../lib/colorMath';

  interface Props {
    value: string;
    onChange: (v: string) => void;
  }

  const { value, onChange }: Props = $props();

  let open = $state(false);
  let container: HTMLDivElement | undefined = $state();

  const safeValue = $derived(/^#[0-9A-Fa-f]{6}$/i.test(value) ? value.toUpperCase() : '#000000');
  const hsv = $derived(hexToHsv(safeValue));
  const hueColor = $derived(hsvToHex({ h: hsv.h, s: 100, v: 100 }));

  function commit(next: { h?: number; s?: number; v?: number }) {
    onChange(hsvToHex({ h: next.h ?? hsv.h, s: next.s ?? hsv.s, v: next.v ?? hsv.v }));
  }

  function dragOnRect(e: PointerEvent, rect: DOMRect, onMove: (xPct: number, yPct: number) => void) {
    const update = (clientX: number, clientY: number) => {
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      onMove(x, y);
    };
    update(e.clientX, e.clientY);
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => update(ev.clientX, ev.clientY);
    const up = (ev: PointerEvent) => {
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
  }

  function onSaturationDown(e: PointerEvent) {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOnRect(e, rect, (x, y) => commit({ s: Math.round(x * 100), v: Math.round((1 - y) * 100) }));
  }

  function onHueDown(e: PointerEvent) {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOnRect(e, rect, (x) => commit({ h: Math.round(x * 360) }));
  }

  function onHexInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value
      .replace(/[^0-9A-Fa-f]/g, '')
      .toUpperCase();
    onChange('#' + raw);
  }

  function onDocumentMouseDown(e: MouseEvent) {
    if (open && container && !container.contains(e.target as Node)) open = false;
  }

  $effect(() => {
    if (!open) return;
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  });
</script>

<div class="relative inline-block mr-2 mb-3 align-middle" bind:this={container}>
  <button
    type="button"
    aria-label="Pick color"
    onclick={() => (open = !open)}
    style:background-color={safeValue}
    class="w-10 h-10 rounded-sm border-2 border-discord-border cursor-pointer hover:border-discord-primary transition-colors block"
  ></button>

  {#if open}
    <div
      class="absolute top-full left-0 z-50 mt-2 p-4 bg-discord-bg-tertiary rounded-sm border border-discord-border shadow-2xl"
    >
      <!-- Saturation/Value rectangle -->
      <div
        role="slider"
        tabindex="0"
        aria-label="Saturation and brightness"
        aria-valuenow={hsv.v}
        onpointerdown={onSaturationDown}
        style:background={`linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`}
        class="relative w-50 h-37.5 rounded touch-none cursor-crosshair select-none"
      >
        <div
          style:left={`${hsv.s}%`}
          style:top={`${100 - hsv.v}%`}
          class="absolute w-4.5 h-4.5 -ml-2.25 -mt-2.25 rounded-full border-[3px] border-white shadow pointer-events-none"
        ></div>
      </div>

      <!-- Hue slider -->
      <div
        role="slider"
        tabindex="0"
        aria-label="Hue"
        aria-valuemin="0"
        aria-valuemax="360"
        aria-valuenow={hsv.h}
        onpointerdown={onHueDown}
        class="relative w-50 h-3.5 mt-3 rounded-[7px] touch-none cursor-pointer select-none"
        style:background={'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'}
      >
        <div
          style:left={`${(hsv.h / 360) * 100}%`}
          class="absolute top-1/2 w-4.5 h-4.5 -ml-2.25 -mt-2.25 rounded-full border-[3px] border-white shadow pointer-events-none"
        ></div>
      </div>

      <!-- Hex input -->
      <div
        class="flex items-center mt-3 bg-discord-input-bg border border-discord-border rounded-sm overflow-hidden focus-within:border-discord-primary"
      >
        <span class="pl-3 pr-0 py-2 text-discord-text-muted text-sm select-none font-mono">#</span>
        <input
          type="text"
          value={safeValue.replace(/^#/, '')}
          oninput={onHexInput}
          maxlength="6"
          placeholder="RRGGBB"
          aria-label="Hex color"
          class="bg-transparent border-none text-sm font-mono uppercase text-discord-text pl-1 pr-3 py-2 w-full outline-none"
        />
      </div>
    </div>
  {/if}
</div>
