<script lang="ts">
  import { onMount } from "svelte";
  import ColorInput from "./ColorInput.svelte";
  import ThemeSection from "./ThemeSection.svelte";
  import {
    buildPreviewUrl,
    type Theme,
    type PreviewState,
    type Layout,
  } from "../lib/buildPreviewUrl";
  import { getConfig } from "../lib/config";

  const initial = getConfig();

  let userId = $state(initial.defaultUserId);
  let inviteUrl = $state(initial.inviteUrl);

  let enableAboutMe = $state(false);
  let aboutMe = $state("");
  let enableDecoration = $state(true);
  let enableSpotify = $state(true);
  let theme = $state<Theme>("dark");
  let nitroColors = $state({ primary: "#8180ff", accent: "#fe80c0" });
  let customColors = $state({
    b1: "#111214",
    b2: "#313338",
    b3: "#505059",
    t1: "#ffffff",
    t2: "#d2d6d8",
  });
  let width = $state(512);
  let overrideBanner = $state(false);
  let bannerUrl = $state("");
  let bannerColor = $state("#000000");

  const REPO_URL = "https://github.com/the-snesler/discord-github-preview";

  let previews = $state<
    Record<Layout, { src: string; markdown: string; rawUrl: string; html: string }>
  >({
    standard: {
      src: initial.defaultUserId ? `/api/user/${initial.defaultUserId}` : "",
      markdown: "",
      rawUrl: "",
      html: "",
    },
    compact: {
      src: initial.defaultUserId ? `/api/user/${initial.defaultUserId}?layout=compact` : "",
      markdown: "",
      rawUrl: "",
      html: "",
    },
    badge: {
      src: initial.defaultUserId ? `/api/user/${initial.defaultUserId}?layout=badge` : "",
      markdown: "",
      rawUrl: "",
      html: "",
    },
  });

  let selectedLayout = $state<Layout>("standard");
  let previewOpacity = $state(1);
  let isUpdating = $state(false);
  let copied = $state<"md" | "url" | "html" | null>(null);

  let lookupUsername = $state("");
  let lookupLoading = $state(false);
  let lookupError = $state("");
  let usernameFound = $state<string>("");

  onMount(() => {
    const cfg = getConfig();
    if (cfg.defaultUserId && !userId) userId = cfg.defaultUserId;
    if (cfg.inviteUrl) inviteUrl = cfg.inviteUrl;
    if (cfg.defaultUserId && !previews.standard.src) {
      previews.standard.src = `/api/user/${cfg.defaultUserId}`;
      previews.compact.src = `/api/user/${cfg.defaultUserId}?layout=compact`;
      previews.badge.src = `/api/user/${cfg.defaultUserId}?layout=badge`;
    }
  });

  let usernameCache = $state<{ id: string; username: string }>({ id: "", username: "" });

  async function generatePreview(silent = false) {
    if (!/^\d{17,}$/.test(userId)) {
      if (!silent) alert("Please enter a valid Discord User ID.");
      return;
    }

    isUpdating = true;
    previewOpacity = 0.5;

    const state: PreviewState = {
      userId,
      enableAboutMe,
      aboutMe,
      enableDecoration,
      enableSpotify,
      theme,
      nitroColors,
      customColors,
      width: width.toString(),
      overrideBanner,
      bannerUrl,
      bannerColor,
    };

    const urls: Record<Layout, string> = {
      standard: buildPreviewUrl(state, "standard"),
      compact: buildPreviewUrl(state, "compact"),
      badge: buildPreviewUrl(state, "badge"),
    };

    try {
      let username = usernameCache.username;
      if (usernameCache.id !== userId) {
        const response = await fetch(`/api/username/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch username");
        const data = await response.json();
        username = data.username;
        usernameCache = { id: userId, username };
      }
      usernameFound = username;

      const preloadImage = (src: string) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
        });
      await Promise.all([
        preloadImage(urls.standard),
        preloadImage(urls.compact),
        preloadImage(urls.badge),
      ]);

      const origin = window.location.origin;
      (["standard", "compact", "badge"] as Layout[]).forEach((layout) => {
        const full = origin + urls[layout];
        const altSuffix =
          layout === "badge"
            ? " status badge"
            : layout === "compact"
              ? " Discord status"
              : " Discord status";
        previews[layout].src = urls[layout];
        previews[layout].rawUrl = full;
        previews[layout].markdown = `[![${username}'s${altSuffix}](${full})](${REPO_URL})`;
        previews[layout].html =
          `<a href="${REPO_URL}"><img src="${full}" alt="${username}'s${altSuffix}" /></a>`;
      });
      previewOpacity = 1;
    } catch (error) {
      console.error("Error:", error);
      if (!silent) alert("Failed to generate preview. Please check the User ID and try again.");
      previewOpacity = 1;
    } finally {
      isUpdating = false;
    }
  }

  async function copyTo(kind: "md" | "url" | "html") {
    const p = previews[selectedLayout];
    const value = kind === "md" ? p.markdown : kind === "url" ? p.rawUrl : p.html;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      copied = kind;
      setTimeout(() => (copied = null), 1800);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  async function handleUsernameLookup() {
    if (!lookupUsername || lookupUsername.length < 2) {
      lookupError = "Username must be at least 2 characters";
      return;
    }
    lookupLoading = true;
    lookupError = "";
    try {
      const response = await fetch(`/api/lookup/${encodeURIComponent(lookupUsername)}`);
      const data = await response.json();
      if (!response.ok) {
        lookupError = data.error || "User not found";
        return;
      }
      userId = data.id;
      lookupError = "";
    } catch (error) {
      lookupError = "Failed to lookup username";
    } finally {
      lookupLoading = false;
    }
  }

  // Debounced auto-regenerate
  $effect(() => {
    void userId;
    void enableAboutMe;
    void aboutMe;
    void enableDecoration;
    void enableSpotify;
    void theme;
    void nitroColors.primary;
    void nitroColors.accent;
    void customColors.b1;
    void customColors.b2;
    void customColors.b3;
    void customColors.t1;
    void customColors.t2;
    void width;
    void overrideBanner;
    void bannerUrl;
    void bannerColor;

    const timeout = setTimeout(() => generatePreview(true), 500);
    return () => clearTimeout(timeout);
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "Enter") generatePreview(false);
  }

  const sliderPct = $derived(Math.round(((width - 128) / (2048 - 128)) * 100));
</script>

<svelte:window onkeydown={onKeydown} />

<div class="panel p-6 md:p-8">
  <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
    <!-- LEFT: configuration -->
    <div>
      
      <h3 class="text-[15px] font-semibold mb-5">Who are you?</h3>
      <p class="mb-2 border-2 border-brand-pink text-ink-dim rounded-sm p-3">
        The bot needs to see you first!
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          class="text-brand-pink hover:underline">Join the server</a
        >.
      </p>
      <div class="mb-2 eyebrow text-[10px]">Discord username</div>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleUsernameLookup();
        }}
        class="flex gap-2 mb-3"
      >
        <input
          type="text"
          value={lookupUsername}
          oninput={(e) => (lookupUsername = (e.target as HTMLInputElement).value)}
          placeholder="tsunibot"
          class="field flex-1"
        />
        <button type="submit" disabled={lookupLoading} class="btn btn-primary px-4 py-2.5">
          {lookupLoading ? "..." : "Look up"}
        </button>
      </form>

      <div class="relative mb-1">
        <input
          type="text"
          value={userId}
          oninput={(e) => (userId = (e.target as HTMLInputElement).value)}
          placeholder="Discord User ID"
          class="field pr-20"
        />
        {#if usernameFound && userId === usernameCache.id}
          <span
            class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-sm text-[11px] font-medium flex items-center gap-1"
            style="background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);"
          >
            ✓ found
          </span>
        {/if}
      </div>
      {#if lookupError}
        <div class="text-[#f87171] text-[12px] mb-2">{lookupError}</div>
      {/if}

      <h3 class="text-[15px] font-semibold mt-6 mb-4">What to show</h3>
      <div class="space-y-3 mb-6">
        {@render row(
          "About Me section",
          enableAboutMe,
          (v) => (enableAboutMe = v),
          enableAboutMe ? "on" : "off"
        )}
        {#if enableAboutMe}
          <textarea
            value={aboutMe}
            oninput={(e) => (aboutMe = (e.target as HTMLTextAreaElement).value)}
            placeholder="A short bio..."
            class="field min-h-20 resize-y text-[13px]"
          ></textarea>
        {/if}
        {@render row(
          "Avatar decoration",
          enableDecoration,
          (v) => (enableDecoration = v),
          enableDecoration ? "ring" : "off"
        )}
        {@render row(
          "Spotify activity",
          enableSpotify,
          (v) => (enableSpotify = v),
          enableSpotify ? "live" : "off"
        )}
        {@render row(
          "Override banner",
          overrideBanner,
          (v) => (overrideBanner = v),
          overrideBanner ? "custom" : "default"
        )}
        {#if overrideBanner}
          <div class="pl-1">
            <input
              type="text"
              value={bannerUrl}
              oninput={(e) => (bannerUrl = (e.target as HTMLInputElement).value)}
              placeholder="https://… (or use a color)"
              class="field mb-2 text-[13px]"
            />
            <div class="flex items-center gap-2">
              <ColorInput value={bannerColor} onChange={(v) => (bannerColor = v)} />
              <span class="text-[12px] text-ink-mute">Banner color fallback</span>
            </div>
          </div>
        {/if}
      </div>

      <div class="mb-6">
        <ThemeSection
          {theme}
          setTheme={(v) => (theme = v)}
          {nitroColors}
          setNitroColors={(v) => (nitroColors = v)}
          {customColors}
          setCustomColors={(v) => (customColors = v)}
        />
      </div>

      <div>
        <div class="flex items-baseline justify-between mb-2">
          <span class="text-[13px] font-semibold">Width</span>
          <span class="text-[12px] text-ink-mute font-mono">{width}px</span>
        </div>
        <input
          type="range"
          min="128"
          max="2048"
          step="8"
          value={width}
          oninput={(e) => (width = Number((e.target as HTMLInputElement).value))}
          class="slider"
          style:--slider-pct={`${sliderPct}%`}
        />
      </div>
    </div>

    <!-- RIGHT: preview -->
    <div>
      <h3 class="text-[15px] font-semibold mb-5">Live preview</h3>
      <div class="grid grid-cols-1 gap-3 mb-3">
        <button
          type="button"
          onclick={() => (selectedLayout = "standard")}
          class="panel-inset p-4 text-left transition-all {selectedLayout === 'standard'
            ? 'ring-2 ring-[rgba(167,139,250,0.5)]'
            : 'hover:border-line-hi'}"
        >
          <div class="eyebrow mb-3">Standard</div>
          {#if previews.standard.src}
            <img
              src={previews.standard.src}
              alt="Standard preview"
              style:opacity={previewOpacity}
              class="h-auto mx-auto rounded-[8px] transition-opacity block"
            />
          {/if}
        </button>

        <div class="flex gap-3">
          <button
            type="button"
            onclick={() => (selectedLayout = "compact")}
            class="panel-inset p-4 text-left transition-all flex-1 {selectedLayout === 'compact'
              ? 'ring-2 ring-[rgba(167,139,250,0.5)]'
              : 'hover:border-line-hi'}"
          >
            <div class="eyebrow mb-3">Compact</div>
            {#if previews.compact.src}
              <img
                src={previews.compact.src}
                alt="Compact preview"
                style:opacity={previewOpacity}
                class="h-auto rounded-sm transition-opacity block"
              />
            {/if}
          </button>
          <button
            type="button"
            onclick={() => (selectedLayout = "badge")}
            class="panel-inset p-4 text-left transition-all {selectedLayout === 'badge'
              ? 'ring-2 ring-[rgba(167,139,250,0.5)]'
              : 'hover:border-line-hi'}"
          >
            <div class="eyebrow mb-3">Badge</div>
            {#if previews.badge.src}
              <img
                src={previews.badge.src}
                alt="Status badge"
                style:opacity={previewOpacity}
                class="h-auto rounded-[4px] transition-opacity block"
                style:max-width="64px"
              />
            {/if}
          </button>
        </div>
      </div>

      <div>
        <div class="flex items-baseline flex-col gap-1 mb-2">
          <span class="eyebrow">Markdown URL</span>
          <span class="text-sm text-ink-mute">
            for the <span class="text-ink-dim font-medium">{selectedLayout}</span> layout
          </span>
        </div>
        <div class="code-box mb-3 min-h-11">
          {previews[selectedLayout].markdown || "— select a user to see the markdown —"}
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            onclick={() => copyTo("md")}
            class="btn {copied === 'md' ? 'btn-success' : 'btn-primary'}"
            disabled={!previews[selectedLayout].markdown}
          >
            {copied === "md" ? "Copied!" : "Copy Markdown"}
          </button>
          <button
            type="button"
            onclick={() => copyTo("url")}
            class="btn {copied === 'url' ? 'btn-success' : ''}"
            disabled={!previews[selectedLayout].rawUrl}
          >
            {copied === "url" ? "Copied!" : "Copy Raw URL"}
          </button>
          <button
            type="button"
            onclick={() => copyTo("html")}
            class="btn {copied === 'html' ? 'btn-success' : ''}"
            disabled={!previews[selectedLayout].html}
          >
            {copied === "html" ? "Copied!" : "HTML"}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

{#snippet row(label: string, value: boolean, set: (v: boolean) => void, badge: string)}
  <label class="flex items-center justify-between gap-3 cursor-pointer select-none">
    <span class="flex items-center gap-3">
      <span class="toggle">
        <input
          type="checkbox"
          checked={value}
          onchange={(e) => set((e.target as HTMLInputElement).checked)}
        />
        <span class="track"><span class="thumb"></span></span>
      </span>
      <span class="text-[14px]">{label}</span>
    </span>
    <span class="text-[11px] font-mono uppercase tracking-wider text-ink-mute">{badge}</span>
  </label>
{/snippet}
