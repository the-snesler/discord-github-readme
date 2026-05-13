<script lang="ts">
  import { onMount } from 'svelte';
  import ColorInput from './ColorInput.svelte';
  import ThemeSection from './ThemeSection.svelte';
  import { buildPreviewUrl, type Theme, type PreviewState, type Layout } from '../lib/buildPreviewUrl';
  import { getConfig } from '../lib/config';

  const initial = getConfig();

  let userId = $state(initial.defaultUserId);
  let inviteUrl = $state(initial.inviteUrl);

  let enableAboutMe = $state(false);
  let aboutMe = $state('');
  let enableDecoration = $state(true);
  let enableSpotify = $state(true);
  let theme = $state<Theme>('dark');
  let nitroColors = $state({ primary: '#8180ff', accent: '#fe80c0' });
  let customColors = $state({
    b1: '#111214',
    b2: '#313338',
    b3: '#505059',
    t1: '#ffffff',
    t2: '#d2d6d8',
  });
  let width = $state('512');
  let overrideBanner = $state(false);
  let bannerUrl = $state('');
  let bannerColor = $state('#000000');

  const REPO_URL = 'https://github.com/the-snesler/discord-github-preview';

  let previews = $state<Record<Layout, { src: string; markdown: string; copied: boolean }>>({
    standard: {
      src: initial.defaultUserId ? `/api/user/${initial.defaultUserId}` : '',
      markdown: '',
      copied: false,
    },
    compact: {
      src: initial.defaultUserId ? `/api/user/${initial.defaultUserId}?layout=compact` : '',
      markdown: '',
      copied: false,
    },
    badge: {
      src: initial.defaultUserId ? `/api/user/${initial.defaultUserId}?layout=badge` : '',
      markdown: '',
      copied: false,
    },
  });
  let rawUrl = $state('');
  let previewOpacity = $state(1);

  let lookupUsername = $state('');
  let lookupLoading = $state(false);
  let lookupError = $state('');

  // Re-read window.__CONFIG__ after mount so SSR (empty placeholder) gets
  // replaced by Express-injected runtime values.
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

  // Track last fetched username to avoid redundant API calls.
  let usernameCache: { id: string; username: string } = { id: '', username: '' };

  async function generatePreview(silent = false) {
    if (!/^\d{17,}$/.test(userId)) {
      if (!silent) alert('Please enter a valid Discord User ID.');
      return;
    }

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
      width,
      overrideBanner,
      bannerUrl,
      bannerColor,
    };

    const urls: Record<Layout, string> = {
      standard: buildPreviewUrl(state, 'standard'),
      compact: buildPreviewUrl(state, 'compact'),
      badge: buildPreviewUrl(state, 'badge'),
    };

    try {
      let username = usernameCache.username;
      if (usernameCache.id !== userId) {
        const response = await fetch(`/api/username/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch username');
        const data = await response.json();
        username = data.username;
        usernameCache = { id: userId, username };
      }

      const preloadImage = (src: string) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
        });
      await Promise.all([preloadImage(urls.standard), preloadImage(urls.compact), preloadImage(urls.badge)]);

      const origin = window.location.origin;
      const fullUrl = origin + urls.standard;
      previews.standard.src = urls.standard;
      previews.compact.src = urls.compact;
      previews.badge.src = urls.badge;
      previews.standard.markdown = `[![${username}'s Discord status](${origin + urls.standard})](${REPO_URL})`;
      previews.compact.markdown = `[![${username}'s Discord status](${origin + urls.compact})](${REPO_URL})`;
      previews.badge.markdown = `[![${username}'s Discord status badge](${origin + urls.badge})](${REPO_URL})`;
      rawUrl = fullUrl;
      previewOpacity = 1;
    } catch (error) {
      console.error('Error:', error);
      if (!silent) alert('Failed to generate preview. Please check the User ID and try again.');
      previewOpacity = 1;
    }
  }

  async function copyLayoutUrl(layout: Layout) {
    const md = previews[layout].markdown;
    if (!md) return;
    try {
      await navigator.clipboard.writeText(md);
      previews[layout].copied = true;
      setTimeout(() => (previews[layout].copied = false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy URL');
    }
  }

  async function handleUsernameLookup() {
    if (!lookupUsername || lookupUsername.length < 2) {
      lookupError = 'Username must be at least 2 characters';
      return;
    }
    lookupLoading = true;
    lookupError = '';
    try {
      const response = await fetch(`/api/lookup/${encodeURIComponent(lookupUsername)}`);
      const data = await response.json();
      if (!response.ok) {
        lookupError = data.error || 'User not found';
        return;
      }
      userId = data.id;
      lookupError = '';
      lookupUsername = '';
    } catch (error) {
      lookupError = 'Failed to lookup username';
    } finally {
      lookupLoading = false;
    }
  }

  // Debounced auto-regenerate when any input changes. The `effect` reads all
  // of the relevant state so Svelte tracks them as dependencies.
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

  // Ctrl+Enter forces a non-silent refresh.
  function onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') generatePreview(false);
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="max-w-[1100px] mx-auto">
  <h1
    class="text-discord-primary mb-8 text-3xl text-center font-bold relative inline-block left-1/2 -translate-x-1/2"
  >
    Discord Profile Preview Generator
    <span
      aria-hidden="true"
      class="block h-[3px] w-[60px] bg-discord-primary mx-auto mt-2.5 rounded"
    ></span>
  </h1>

  <div class="flex gap-6 mb-8 flex-wrap">
    <div
      class="flex-1 min-w-[300px] bg-discord-bg-secondary p-6 rounded-[var(--radius-discord)] border border-discord-border"
    >
      <p
        class="bg-discord-warn text-black p-4 rounded-[var(--radius-discord)] mb-5 text-sm font-bold"
      >
        ⚠️ Before starting,
        <a href={inviteUrl} target="_blank" rel="noreferrer" class="text-[#7d1010] underline">
          join the Discord server
        </a>
        so the bot can access your profile information.
      </p>

      <div class="mb-6">
        <span class="block mb-2 font-semibold text-discord-text-muted text-sm">
          Lookup by username:
        </span>
        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleUsernameLookup();
          }}
          class="flex gap-2"
        >
          <input
            type="text"
            value={lookupUsername}
            oninput={(e) => (lookupUsername = (e.target as HTMLInputElement).value)}
            placeholder="Enter Discord username"
            class="field-input flex-1 mb-0"
          />
          <button
            type="submit"
            disabled={lookupLoading}
            class="btn-primary w-auto px-5 mb-0 whitespace-nowrap"
          >
            {lookupLoading ? 'Looking up...' : 'Lookup'}
          </button>
        </form>
        {#if lookupError}
          <div class="text-[#ff6b6b] text-[13px] mt-2">{lookupError}</div>
        {/if}
        <span class="block mb-2 mt-2 font-semibold text-discord-text-muted text-sm">
          Or enter User ID
        </span>
        <input
          type="text"
          value={userId}
          oninput={(e) => (userId = (e.target as HTMLInputElement).value)}
          placeholder="Discord User ID"
          class="field-input"
        />
      </div>

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input
            type="checkbox"
            id="enableAboutMe"
            checked={enableAboutMe}
            onchange={(e) => (enableAboutMe = (e.target as HTMLInputElement).checked)}
            class="w-[18px] h-[18px] mr-2.5 cursor-pointer accent-discord-primary"
          />
          <label for="enableAboutMe" class="cursor-pointer">Enable About Me</label>
        </div>

        {#if enableAboutMe}
          <span class="block mb-2 font-semibold text-discord-text-muted text-sm">About Me</span>
          <textarea
            value={aboutMe}
            oninput={(e) => (aboutMe = (e.target as HTMLTextAreaElement).value)}
            placeholder="About me content..."
            class="field-input min-h-[120px] resize-y"
          ></textarea>
        {/if}

        <div class="flex items-center mb-3">
          <input
            type="checkbox"
            id="enableDecoration"
            checked={enableDecoration}
            onchange={(e) => (enableDecoration = (e.target as HTMLInputElement).checked)}
            class="w-[18px] h-[18px] mr-2.5 cursor-pointer accent-discord-primary"
          />
          <label for="enableDecoration" class="cursor-pointer">Enable Avatar Decoration</label>
        </div>

        <div class="flex items-center mb-3">
          <input
            type="checkbox"
            id="enableSpotify"
            checked={enableSpotify}
            onchange={(e) => (enableSpotify = (e.target as HTMLInputElement).checked)}
            class="w-[18px] h-[18px] mr-2.5 cursor-pointer accent-discord-primary"
          />
          <label for="enableSpotify" class="cursor-pointer">Enable Spotify Activity</label>
        </div>

        <div class="flex items-center mb-3">
          <input
            type="checkbox"
            id="overrideBanner"
            checked={overrideBanner}
            onchange={(e) => (overrideBanner = (e.target as HTMLInputElement).checked)}
            class="w-[18px] h-[18px] mr-2.5 cursor-pointer accent-discord-primary"
          />
          <label for="overrideBanner" class="cursor-pointer">Override Banner</label>
        </div>

        {#if overrideBanner}
          <span class="block mb-2 font-semibold text-discord-text-muted text-sm">Banner URL</span>
          <input
            type="text"
            value={bannerUrl}
            oninput={(e) => (bannerUrl = (e.target as HTMLInputElement).value)}
            placeholder="https://example.com/banner.png"
            class="field-input"
          />
          <span class="block mb-2 font-semibold text-discord-text-muted text-sm">
            Banner Color
          </span>
          <ColorInput value={bannerColor} onChange={(v) => (bannerColor = v)} />
        {/if}
      </div>

      <ThemeSection
        {theme}
        setTheme={(v) => (theme = v)}
        {nitroColors}
        setNitroColors={(v) => (nitroColors = v)}
        {customColors}
        setCustomColors={(v) => (customColors = v)}
      />

      <div class="mb-6">
        <div class="mb-3">
          <label for="widthInput" class="block mb-2 font-semibold text-discord-text-muted text-sm">
            Image Width (px)
          </label>
          <input
            type="number"
            id="widthInput"
            min="128"
            max="2048"
            step="1"
            value={width}
            oninput={(e) => (width = (e.target as HTMLInputElement).value)}
            placeholder="Width in pixels"
            class="field-input"
          />
        </div>
      </div>
    </div>

    <div
      class="flex-1 min-w-[300px] bg-discord-bg-secondary p-6 rounded-[var(--radius-discord)] border border-discord-border self-start sticky top-5"
    >
      {#each [
        { layout: 'standard' as Layout, label: 'Standard Layout', alt: 'Discord Profile Preview', badgeStyle: false },
        { layout: 'compact' as Layout, label: 'Compact Layout', alt: 'Discord Profile Preview (Compact)', badgeStyle: false },
        { layout: 'badge' as Layout, label: 'Badge Layout', alt: 'Discord Status Badge', badgeStyle: true },
      ] as section (section.layout)}
        <div class="mb-6">
          <span class="block mb-2 font-semibold text-discord-text-muted text-sm">{section.label}</span>
          <div
            class="bg-discord-bg-tertiary p-5 rounded-[var(--radius-discord)] mb-2 border border-discord-border overflow-hidden"
          >
            {#if previews[section.layout].src}
              <img
                src={previews[section.layout].src}
                alt={section.alt}
                style:opacity={previewOpacity}
                style:max-width={section.badgeStyle ? '50px' : '100%'}
                class="h-auto rounded transition-opacity"
              />
            {/if}
          </div>
          <div
            class="bg-discord-input-bg p-4 rounded-[var(--radius-discord)] break-all border border-discord-border font-mono text-[13px] text-discord-text-muted"
          >
            {previews[section.layout].markdown}
          </div>
          <button
            onclick={() => copyLayoutUrl(section.layout)}
            class="btn-primary mt-2 {previews[section.layout].copied ? 'btn-success' : ''}"
          >
            {previews[section.layout].copied ? 'Copied!' : 'Copy Markdown URL'}
          </button>
        </div>
      {/each}

      <div>
        <span class="block mb-2 font-semibold text-discord-text-muted text-sm">Raw URL</span>
        <div
          class="bg-discord-input-bg p-4 rounded-[var(--radius-discord)] break-all border border-discord-border font-mono text-[13px] text-discord-text-muted"
        >
          {rawUrl}
        </div>
      </div>
    </div>
  </div>
</div>
