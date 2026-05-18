<script lang="ts">
  import { scale } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import type { Layout } from "../lib/buildPreviewUrl";

  let { markdown, selectedLayout }: { markdown: string; selectedLayout: Layout } = $props();

  let githubUsername = $state("");
  let copied = $state(false);

  let step1Done = $state(false);
  let step2Done = $state(false);
  let step3Copied = $state(false);
  let step3Opened = $state(false);
  let step4Done = $state(false);

  let step3Done = $derived(step3Copied && step3Opened);

  const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

  let isValid = $derived(USERNAME_RE.test(githubUsername));
  let isEmpty = $derived(githubUsername.length === 0);
  let showError = $derived(!isEmpty && !isValid);

  let createUrl = $derived(
    `https://github.com/new?name=${encodeURIComponent(githubUsername)}&description=My+profile+README`
  );
  let repoUrl = $derived(`https://github.com/${encodeURIComponent(githubUsername)}/${encodeURIComponent(githubUsername)}`);
  let editUrl = $derived(`${repoUrl}/edit/main/README.md`);
  let profileUrl = $derived(`https://github.com/${encodeURIComponent(githubUsername)}`);

  async function copyMarkdown() {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      copied = true;
      step3Copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }
</script>

<div class="panel p-6 md:p-8 mt-6">
  <div class="mb-6">
    <div class="eyebrow">Drop it in</div>
    <h3 class="mt-2 text-[22px] md:text-[26px] font-bold tracking-tight">
      Add it to your GitHub profile
    </h3>
    <p class="mt-2 text-[14px] text-ink-dim">
      GitHub turns a repo named after yourself into your profile README (the page everyone sees
      at <span class="font-mono text-ink">github.com/&lt;you&gt;</span>). <br /> Enter your GitHub
      username and we'll hand you the right links.
    </p>
  </div>

  <div class="mb-7 max-w-md">
    <div class="mb-2 eyebrow text-[10px]">GitHub username</div>
    <input
      type="text"
      value={githubUsername}
      oninput={(e) => (githubUsername = (e.target as HTMLInputElement).value.trim())}
      placeholder="octocat"
      autocomplete="off"
      spellcheck="false"
      class="field"
    />
    {#if showError}
      <div class="text-[#f87171] text-[12px] mt-2">
        Use 1–39 letters, numbers, or hyphens (no leading/trailing or consecutive hyphens).
      </div>
    {/if}
  </div>

  <div class="steps">
    <!-- Step 1 -->
    <div class="step" class:step-done={step1Done}>
      <div class="step-circle">
        {#if step1Done}
          <span in:scale={{ duration: 280, start: 0.3, easing: backOut }}>✓</span>
        {:else}
          <span>1</span>
        {/if}
      </div>
      <div class="panel-inset flex-1 p-5 step-body">
        <h4 class="text-[15px] font-semibold mb-1.5">Set up your profile repo</h4>
        <p class="text-[13px] leading-relaxed text-ink-dim mb-4">
          Create a new public repo with the <em>same name</em> as your username. If you already
          have one, skip to step 2.
        </p>
        <div class="flex flex-wrap gap-2">
          {#if isValid}
            <a
              href={createUrl}
              target="_blank"
              rel="noreferrer"
              onclick={() => (step1Done = true)}
              class="btn btn-primary"
            >
              Create repo →
            </a>
            <button
              target="_blank"
              rel="noreferrer"
              onclick={() => (step1Done = true)}
              class="btn"
            >
              I already have one
            </button>
          {:else}
            <span class="btn btn-primary btn-disabled">Create repo →</span>
            <span class="btn btn-disabled">I already have one</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Step 2 -->
    <div class="step" class:step-done={step2Done}>
      <div class="step-circle">
        {#if step2Done}
          <span in:scale={{ duration: 280, start: 0.3, easing: backOut }}>✓</span>
        {:else}
          <span>2</span>
        {/if}
      </div>
      <div class="panel-inset flex-1 p-5 step-body">
        <h4 class="text-[15px] font-semibold mb-1.5">Create your Discord card</h4>
        <p class="text-[13px] leading-relaxed text-ink-dim mb-3">
          Use the editor above to set your user ID and customize your card.
        </p>
        <div class="flex flex-wrap gap-2">
          <a href="#builder" onclick={() => (step2Done = true)} class="btn">
            Open editor →
          </a>
        </div>
      </div>
    </div>

    <!-- Step 3 -->
    <div class="step" class:step-done={step3Done}>
      <div class="step-circle">
        {#if step3Done}
          <span in:scale={{ duration: 280, start: 0.3, easing: backOut }}>✓</span>
        {:else}
          <span>3</span>
        {/if}
      </div>
      <div class="panel-inset flex-1 p-5 step-body">
        <h4 class="text-[15px] font-semibold mb-1.5">Add it to your README.md</h4>
        <p class="text-[13px] leading-relaxed text-ink-dim mb-3">
          Open the README editor and paste this Markdown
          <span class="text-ink-mute">(from the <span class="text-ink-dim font-medium">{selectedLayout}</span> layout above)</span>:
        </p>
        <div class="code-box mb-4 min-h-11">
          {markdown || "— look up your Discord username above to generate the snippet —"}
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            onclick={copyMarkdown}
            class="btn w-36 {copied ? 'btn-success' : ''}"
            disabled={!markdown}
          >
            {copied ? "Copied!" : "Copy Markdown"}
          </button>
          {#if isValid}
            <a
              href={editUrl}
              target="_blank"
              rel="noreferrer"
              onclick={() => (step3Opened = true)}
              class="btn btn-primary"
            >
              Open README editor →
            </a>
          {:else}
            <span class="btn btn-primary btn-disabled">Open README editor →</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Step 4 -->
    <div class="step" class:step-done={step4Done}>
      <div class="step-circle">
        {#if step4Done}
          <span in:scale={{ duration: 280, start: 0.3, easing: backOut }}>✓</span>
        {:else}
          <span>4</span>
        {/if}
      </div>
      <div class="panel-inset flex-1 p-5 step-body">
        <h4 class="text-[15px] font-semibold mb-1.5">See it live</h4>
        <p class="text-[13px] leading-relaxed text-ink-dim mb-4">
          Commit the change. Your Discord status will show up on your profile every time it loads.
        </p>
        <div class="flex flex-wrap gap-2">
          {#if isValid}
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              onclick={() => (step4Done = true)}
              class="btn btn-primary"
            >
              View my profile →
            </a>
          {:else}
            <span class="btn btn-primary btn-disabled">View my profile →</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .steps {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .step {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .step:has(+ .step)::after {
    content: "";
    position: absolute;
    left: 17px;
    top: 0;
    height: calc(100% + 20px);
    width: 2px;
    margin-left: -0.5px;
    border-radius: 2px;
    background: rgba(167, 139, 250, 0.28);
    pointer-events: none;
    transition: background 450ms ease;
  }
  .step.step-done::after {
    background: linear-gradient(180deg, #1a7151, #06432f);
  }
  .step-circle {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 14px;
    color: white;
    background: linear-gradient(135deg, #f472b6 0%, #a78bfa 100%);
    box-shadow: 0 6px 18px -6px rgba(244, 114, 182, 0.55);
    position: relative;
    z-index: 1;
    transition: background 300ms ease, box-shadow 300ms ease;
  }
  .step-done .step-circle {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    box-shadow: 0 6px 18px -6px rgba(16, 185, 129, 0.55);
    animation: pop 420ms ease;
  }

  @keyframes pop {
    0% { transform: scale(1); }
    40% { transform: scale(1.18); }
    100% { transform: scale(1); }
  }
  .step-body {
    transition: opacity 300ms ease;
  }
  .step-done .step-body {
    opacity: 0.55;
  }
  .btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
