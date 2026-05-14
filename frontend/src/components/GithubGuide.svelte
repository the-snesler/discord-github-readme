<script lang="ts">
  import type { Layout } from "../lib/buildPreviewUrl";

  let { markdown, selectedLayout }: { markdown: string; selectedLayout: Layout } = $props();

  let githubUsername = $state("");
  let copied = $state(false);

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
    <p class="mt-2 text-[14px] text-ink-dim max-w-160">
      GitHub turns a repo named after yourself into your profile README — the page everyone sees
      at <span class="font-mono text-ink">github.com/&lt;you&gt;</span>. Enter your GitHub
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
    <div class="step">
      <div class="step-circle">1</div>
      <div class="panel-inset flex-1 p-5">
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
              class="btn btn-primary"
            >
              Create repo →
            </a>
            <a href={repoUrl} target="_blank" rel="noreferrer" class="btn">
              I already have one
            </a>
          {:else}
            <span class="btn btn-primary btn-disabled">Create repo →</span>
            <span class="btn btn-disabled">I already have one</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Step 2 -->
    <div class="step">
      <div class="step-circle">2</div>
      <div class="panel-inset flex-1 p-5">
        <h4 class="text-[15px] font-semibold mb-1.5">Add your Discord card</h4>
        <p class="text-[13px] leading-relaxed text-ink-dim mb-3">
          Open the README editor and paste this Markdown
          <span class="text-ink-mute">(from the <span class="text-ink-dim font-medium">{selectedLayout}</span> layout above)</span>:
        </p>
        <div class="code-box mb-4 min-h-11">
          {markdown || "— look up your Discord username above to generate the snippet —"}
        </div>
        <div class="flex flex-wrap gap-2">
          {#if isValid}
            <a href={editUrl} target="_blank" rel="noreferrer" class="btn btn-primary">
              Open README editor →
            </a>
          {:else}
            <span class="btn btn-primary btn-disabled">Open README editor →</span>
          {/if}
          <button
            type="button"
            onclick={copyMarkdown}
            class="btn {copied ? 'btn-success' : ''}"
            disabled={!markdown}
          >
            {copied ? "Copied!" : "Copy Markdown"}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3 -->
    <div class="step">
      <div class="step-circle">3</div>
      <div class="panel-inset flex-1 p-5">
        <h4 class="text-[15px] font-semibold mb-1.5">See it live</h4>
        <p class="text-[13px] leading-relaxed text-ink-dim mb-4">
          Commit the change. Your Discord status will show up on your profile every time it loads.
        </p>
        <div class="flex flex-wrap gap-2">
          {#if isValid}
            <a href={profileUrl} target="_blank" rel="noreferrer" class="btn btn-primary">
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
  .steps::before {
    content: "";
    position: absolute;
    left: 17px;
    top: 36px;
    bottom: 36px;
    width: 1px;
    background: linear-gradient(
      180deg,
      rgba(244, 114, 182, 0.35),
      rgba(167, 139, 250, 0.35),
      rgba(255, 255, 255, 0.08)
    );
    pointer-events: none;
  }
  .step {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 16px;
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
  }
  .btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
