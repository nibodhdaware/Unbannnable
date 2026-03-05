(() => {
  const PANEL_ID = "unbannnable-inline-sidebar-host";
  const RULES_SELECTORS = [
    '[data-testid="post-guidelines"]',
    '[data-testid="community-rules"]',
    'shreddit-post-guidelines',
    'faceplate-community-guidelines',
  ];

  const TITLE_SELECTORS = [
    'textarea[placeholder*="title" i]',
    'input[placeholder*="title" i]',
    'textarea[name="title"]',
    'input[name="title"]',
    '[data-testid="post-title-input"]',
  ];

  const BODY_SELECTORS = [
    'textarea[placeholder*="body" i]',
    'textarea[name="text"]',
    '[data-testid="post-textarea"]',
    'div[role="textbox"][contenteditable="true"]',
  ];

  const SUBMIT_SELECTORS = [
    'button[type="submit"]',
    '[data-testid="post-submit-button"]',
    '[data-test-id="post-submit-button"]',
  ];

  let appBaseUrl = "https://www.unbannnable.com";
  let sessionToken = null;
  let lastDraftHash = "";
  let latestDraft = null;
  let authInfo = { isLoggedIn: false, credits: 0, usage: null };
  let liveDraft = { title: "", body: "" };
  const COLLAPSE_KEY = "unbannnable_ext_collapsed";
  let isCollapsed = true;
  let isActive = true;
  let pollTimer = null;
  let domObserver = null;
  let onFocus = null;
  let onInput = null;

  const state = {
    status: "idle",
    output: "Run analysis to see compliance and risk insights.",
  };

  try {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === "0") isCollapsed = false;
    if (saved === "1") isCollapsed = true;
  } catch (_e) {}

  function findFirst(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function queryAllDeep(selector, root = document) {
    const results = [];
    const seen = new Set();
    const stack = [root];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node || seen.has(node)) continue;
      seen.add(node);

      if (node.querySelectorAll) {
        for (const match of node.querySelectorAll(selector)) {
          results.push(match);
        }
      }

      if (node.children) {
        for (const child of node.children) {
          if (child.shadowRoot) stack.push(child.shadowRoot);
        }
      }
    }

    return results;
  }

  function findFirstDeep(selectors) {
    for (const selector of selectors) {
      const matches = queryAllDeep(selector);
      if (matches.length > 0) return matches[0];
    }
    return null;
  }

  function readText(el) {
    if (!el) return "";
    if ("value" in el && typeof el.value === "string") return el.value.trim();
    if (el.getAttribute?.("contenteditable") === "true") {
      return (el.innerText || el.textContent || "").trim();
    }
    return (el.textContent || "").trim();
  }

  function getSubredditFromUrl() {
    const match = window.location.pathname.match(/\/r\/([^/]+)/i);
    return match?.[1] || "";
  }

  function findPostButton() {
    const candidates = [];
    for (const selector of SUBMIT_SELECTORS) {
      candidates.push(...queryAllDeep(selector));
    }

    return (
      candidates.find((btn) => {
        const label = (btn.innerText || btn.textContent || "").toLowerCase();
        return label.includes("post") || label.includes("publish");
      }) || null
    );
  }

  function getDraft() {
    const titleEl = findFirstDeep(TITLE_SELECTORS);
    const bodyEl = findFirstDeep(BODY_SELECTORS);
    const postBtn = findPostButton();
    const selectedTitle = readText(titleEl);
    const selectedBody = readText(bodyEl);

    const draft = {
      subreddit: getSubredditFromUrl(),
      title: selectedTitle || liveDraft.title || "",
      body: selectedBody || liveDraft.body || "",
      canPost: Boolean(postBtn && !postBtn.disabled),
      pageUrl: window.location.href,
    };

    return draft;
  }

  function getRulesElement() {
    for (const selector of RULES_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    const allCards = [...document.querySelectorAll("div, section, aside")];
    return (
      allCards.find((el) => {
        const text = (el.textContent || "").toLowerCase();
        return text.includes("rules") && text.includes("1") && text.length < 2000;
      }) || null
    );
  }

  function getRulesCard() {
    const rulesEl = getRulesElement();
    if (!rulesEl) return null;
    return (
      rulesEl.closest("aside, section, shreddit-post-guidelines, faceplate-card, div") ||
      rulesEl
    );
  }

  function createOrRelocateHost() {
    const existing = document.getElementById(PANEL_ID);
    const host = existing || document.createElement("div");
    if (!existing) {
      host.id = PANEL_ID;
      host.style.width = "100%";
      host.style.marginBottom = "12px";
    }

    const rulesCard = getRulesCard();
    if (rulesCard && rulesCard.parentElement) {
      if (host.parentElement !== rulesCard.parentElement || host.nextSibling !== rulesCard) {
        rulesCard.parentElement.insertBefore(host, rulesCard);
      }
      host.dataset.placement = "inline";
      host.style.position = "";
      host.style.right = "";
      host.style.bottom = "";
      host.style.zIndex = "";
      host.style.width = "100%";
      host.style.marginBottom = "12px";
      return host;
    }

    host.dataset.placement = "floating";
    const composerRoot = document.querySelector("main") || document.body;
    if (host.parentElement !== composerRoot) {
      composerRoot.appendChild(host);
    }
    host.style.position = "fixed";
    host.style.right = "16px";
    host.style.bottom = "16px";
    host.style.zIndex = "2147483646";
    host.style.width = "340px";
    host.style.marginBottom = "0";

    return host;
  }

  function deactivate() {
    if (!isActive) return;
    isActive = false;

    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (domObserver) {
      domObserver.disconnect();
      domObserver = null;
    }
    if (onFocus) {
      window.removeEventListener("focus", onFocus);
      onFocus = null;
    }
    if (onInput) {
      window.removeEventListener("input", onInput, true);
      onInput = null;
    }
  }

  function isContextInvalidatedError(error) {
    const msg = String(error?.message || error || "");
    return msg.includes("Extension context invalidated");
  }

  async function request(type, payload = {}) {
    if (!isActive) return null;
    if (!chrome?.runtime?.id) {
      deactivate();
      return null;
    }

    try {
      return await chrome.runtime.sendMessage({ type, ...payload });
    } catch (error) {
      if (isContextInvalidatedError(error)) {
        deactivate();
        return null;
      }
      throw error;
    }
  }

  async function callApi(path, method = "GET", body = undefined) {
    if (!isActive) return null;
    const result = await request("API_REQUEST", {
      path,
      method,
      body,
      baseUrl: appBaseUrl,
      sessionToken,
    });
    return result;
  }

  function getAlternateBaseUrl(url) {
    if (url.includes("://www.")) {
      return url.replace("://www.", "://");
    }
    return url.replace("://", "://www.");
  }

  async function switchBaseUrlIfNeeded() {
    const alternate = getAlternateBaseUrl(appBaseUrl);
    const alternateTokenResult = await request("GET_SESSION_TOKEN", {
      baseUrl: alternate,
    });
    const alternateSessionToken = alternateTokenResult?.sessionToken || null;

    const test = await request("API_REQUEST", {
      path: "/api/users/credits",
      method: "GET",
      baseUrl: alternate,
      sessionToken: alternateSessionToken,
    });

    if (test?.ok || test?.status !== 401) {
      appBaseUrl = alternate;
      sessionToken = alternateSessionToken;
      await request("SET_APP_BASE_URL", { baseUrl: alternate }).catch(() => {});
      return test;
    }

    return null;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function classifyInputTarget(target) {
    if (!target) return null;
    const tag = (target.tagName || "").toLowerCase();
    const contentEditable = target.getAttribute?.("contenteditable") === "true";
    if (!(tag === "input" || tag === "textarea" || contentEditable)) return null;

    const text = readText(target);
    if (!text) return null;

    const meta = [
      target.getAttribute?.("placeholder") || "",
      target.getAttribute?.("name") || "",
      target.getAttribute?.("aria-label") || "",
      target.getAttribute?.("data-testid") || "",
      target.id || "",
      target.className || "",
    ]
      .join(" ")
      .toLowerCase();

    if (meta.includes("title") || (tag === "input" && !meta.includes("search"))) {
      return { kind: "title", text };
    }

    if (
      meta.includes("body") ||
      meta.includes("markdown") ||
      meta.includes("text") ||
      contentEditable ||
      tag === "textarea"
    ) {
      return { kind: "body", text };
    }

    return null;
  }

  function render(root) {
    const usage = authInfo.usage || {
      monthlyCreditsUsed: 0,
      analysesThisMonth: 0,
    };

    root.innerHTML = `
      <style>
        .ub-wrap{font-family:Inter,Segoe UI,Roboto,sans-serif;background:#fff;border:1px solid #ffd8c9;border-radius:14px;color:#141414;box-shadow:0 8px 28px rgba(0,0,0,.15);overflow:hidden}
        .ub-accordion{margin:0}
        .ub-summary{list-style:none;cursor:pointer;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:10px}
        .ub-summary::-webkit-details-marker{display:none}
        .ub-summary:hover{background:#fff8f4}
        .ub-chevron{font-size:14px;color:#666}
        .ub-accordion[open] .ub-chevron{transform:rotate(180deg)}
        .ub-content{padding:0 12px 12px}
        .ub-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
        .ub-left{display:flex;flex-direction:column;gap:2px}
        .ub-controls{display:flex;gap:6px;align-items:center}
        .ub-title{font-size:16px;font-weight:800;margin:0;color:#ff4500}
        .ub-sub{font-size:12px;color:#666;margin-top:2px}
        .ub-btn{border:0;border-radius:10px;padding:9px 10px;font-size:12px;font-weight:700;cursor:pointer}
        .ub-btn-primary{background:#ff4500;color:#fff}
        .ub-btn-primary:hover{background:#e03d00}
        .ub-btn-ghost{background:#fff;border:1px solid #e7e1dd;color:#666}
        .ub-btn-outline{background:#fff;color:#ff4500;border:1px solid #ff4500}
        .ub-card{border:1px solid #f1ece8;border-radius:10px;padding:9px;margin-bottom:8px;background:#fff}
        .ub-label{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#777;margin-bottom:4px}
        .ub-val{font-size:12px;font-weight:600;line-height:1.35;word-break:break-word}
        .ub-muted{color:#666;font-weight:500}
        .ub-stats{display:flex;gap:8px;margin:8px 0}
        .ub-stat{flex:1;border:1px solid #f1ece8;border-radius:8px;padding:7px;background:#fff8f4}
        .ub-k{font-size:10px;color:#666;text-transform:uppercase}
        .ub-v{font-size:14px;font-weight:800;margin-top:2px}
        .ub-status{display:inline-flex;padding:2px 8px;border-radius:999px;font-size:11px;background:#f4f4f4;color:#666;text-transform:capitalize}
        .ub-status.ok{background:#e9f8e9;color:#1f7a1f}
        .ub-status.bad{background:#fdeaea;color:#b42222}
        .ub-status.warn{background:#fff3e5;color:#9a4e00}
        .ub-output{font-size:12px;line-height:1.42;white-space:pre-wrap;color:#333;max-height:200px;overflow:auto}
        .ub-row{display:flex;gap:8px;margin-top:8px}
        .ub-row > button{flex:1}
        .ub-collapsed-row{display:flex;justify-content:space-between;align-items:center;gap:8px}
        .ub-chip{font-size:11px;padding:3px 8px;border-radius:999px;background:#fff3e5;color:#9a4e00;border:1px solid #ffd9b4;text-transform:capitalize}
        .ub-chip.safe{background:#e9f8e9;color:#1f7a1f;border-color:#bfe3bf}
        .ub-chip.risky,.ub-chip.error{background:#fdeaea;color:#b42222;border-color:#efc2c2}
      </style>
      <section class="ub-wrap">
        <details id="ubAccordion" class="ub-accordion" ${isCollapsed ? "" : "open"}>
          <summary class="ub-summary">
            <div class="ub-left">
              <h3 class="ub-title">Unbannnable</h3>
              <div class="ub-sub">Post check before publish</div>
            </div>
            <div class="ub-controls">
              <span class="ub-chip ${state.status}">${state.status}</span>
              <span class="ub-chevron">▾</span>
            </div>
          </summary>

          <div class="ub-content">
            <div class="ub-head">
              <div></div>
              <button id="ubRefresh" class="ub-btn ub-btn-ghost" type="button">Refresh</button>
            </div>

            <div class="ub-collapsed-row" style="margin-top:0;margin-bottom:8px">
            <div class="ub-val ${latestDraft?.subreddit ? "" : "ub-muted"}">${latestDraft?.subreddit ? `r/${escapeHtml(latestDraft.subreddit)}` : "No subreddit detected"}</div>
          </div>

          <div class="ub-card">
            <div class="ub-label">Subreddit</div>
            <div class="ub-val">${latestDraft?.subreddit ? `r/${escapeHtml(latestDraft.subreddit)}` : "Unknown"}</div>
          </div>

          <div class="ub-card">
            <div class="ub-label">Title</div>
            <div class="ub-val ${latestDraft?.title ? "" : "ub-muted"}">${latestDraft?.title ? escapeHtml(latestDraft.title) : "Waiting for title..."}</div>
          </div>

          <div class="ub-card">
            <div class="ub-label">Body</div>
            <div class="ub-val ${latestDraft?.body ? "" : "ub-muted"}">${latestDraft?.body ? escapeHtml(latestDraft.body) : "No body captured"}</div>
          </div>

          ${authInfo.isLoggedIn ? `
            <div class="ub-stats">
              <div class="ub-stat"><div class="ub-k">Credits</div><div class="ub-v">${authInfo.credits ?? 0}</div></div>
              <div class="ub-stat"><div class="ub-k">Used</div><div class="ub-v">${usage.monthlyCreditsUsed ?? 0}</div></div>
              <div class="ub-stat"><div class="ub-k">Analyses</div><div class="ub-v">${usage.analysesThisMonth ?? 0}</div></div>
            </div>
          ` : `
            <div class="ub-card">
              <div class="ub-val ub-muted">Log in with Clerk to run analysis and track credits.</div>
            </div>
          `}

          <div class="ub-row">
            ${authInfo.isLoggedIn
              ? `<button id="ubAnalyze" class="ub-btn ub-btn-primary" type="button">Analyze</button>`
              : `<button id="ubLogin" class="ub-btn ub-btn-primary" type="button">Log in</button>`}
            <button id="ubDeep" class="ub-btn ub-btn-outline" type="button">In-depth</button>
          </div>

          <div class="ub-card" style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div class="ub-label" style="margin:0">Analysis</div>
              <span class="ub-status ${state.status === "safe" ? "ok" : state.status === "risky" || state.status === "error" ? "bad" : state.status === "analyzing" || state.status === "login required" || state.status === "draft missing" ? "warn" : ""}">${state.status}</span>
            </div>
            <div class="ub-output">${state.output}</div>
          </div>
          </div>
        </details>
      </section>
    `;

    root.querySelector("#ubAccordion")?.addEventListener("toggle", (event) => {
      isCollapsed = !event.currentTarget.open;
      try {
        localStorage.setItem(COLLAPSE_KEY, isCollapsed ? "1" : "0");
      } catch (_e) {}
    });

    root.querySelector("#ubRefresh")?.addEventListener("click", async () => {
      await refreshAll(true);
    });

    root.querySelector("#ubLogin")?.addEventListener("click", () => {
      window.open(`${appBaseUrl}/app?source=chrome-extension`, "_blank");
    });

    root.querySelector("#ubAnalyze")?.addEventListener("click", async () => {
      try {
        await runAnalysis(true);
      } catch (_e) {}
    });

    root.querySelector("#ubDeep")?.addEventListener("click", () => {
      if (!latestDraft?.subreddit || !latestDraft?.title) return;

      request("OPEN_DEEP_ANALYSIS", {
        payload: {
          subreddit: latestDraft.subreddit,
          title: latestDraft.title,
          body: latestDraft.body || "",
        },
      }).catch(() => {});
    });
  }

  function mountPanel() {
    if (!isActive) return;
    const host = createOrRelocateHost();
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    render(root);
  }

  async function fetchAuthInfo() {
    if (!isActive) return;
    if (!sessionToken) {
      const tokenResult = await request("GET_SESSION_TOKEN", {
        baseUrl: appBaseUrl,
      });
      sessionToken = tokenResult?.sessionToken || null;
    }

    let res = await callApi("/api/users/credits");
    if (res?.status === 401) {
      const tokenResult = await request("GET_SESSION_TOKEN", {
        baseUrl: appBaseUrl,
      });
      sessionToken = tokenResult?.sessionToken || null;
      const fallback = await switchBaseUrlIfNeeded();
      if (fallback) res = fallback;
    }
    if (!res?.ok || res.status === 401) {
      authInfo = { isLoggedIn: false, credits: 0, usage: null };
      return;
    }

    authInfo = {
      isLoggedIn: true,
      credits: res.payload?.credits || 0,
      usage: res.payload?.usage || null,
    };
  }

  async function runAnalysis(forceRender = false) {
    if (!isActive) return;
    latestDraft = getDraft();

    if (!latestDraft.subreddit || !latestDraft.title) {
      state.status = "draft missing";
      state.output = "Could not detect subreddit/title from the Reddit composer yet.";
      if (forceRender) mountPanel();
      return;
    }

    if (!authInfo.isLoggedIn) {
      state.status = "login required";
      state.output = "Please log in first to run analysis.";
      if (forceRender) mountPanel();
      return;
    }

    if ((authInfo.credits || 0) <= 0) {
      state.status = "no credits";
      state.output = "You have no credits left. Top up on Unbannnable to continue.";
      if (forceRender) mountPanel();
      return;
    }

    state.status = "analyzing";
    state.output = "Running subreddit rule viability check...";
    mountPanel();

    const params = new URLSearchParams({
      subreddit: latestDraft.subreddit,
      title: latestDraft.title,
      body: latestDraft.body || "",
    });

    const res = await callApi(`/api/reddit/check-post-viability?${params.toString()}`);
    if (!res?.ok) {
      state.status = "error";
      state.output = `Analysis failed: ${res?.payload?.error || `HTTP ${res?.status || 500}`}`;
      mountPanel();
      return;
    }

    const canPost = Boolean(res.payload?.analysis?.canPost);
    const conflicts = res.payload?.analysis?.conflictingRules || [];
    const suggestions = res.payload?.analysis?.suggestions || [];

    state.status = canPost ? "safe" : "risky";
    state.output = [
      `Result: ${canPost ? "Likely safe to post" : "Potential rule conflicts"}`,
      `Reason: ${res.payload?.analysis?.reason || "No reason returned"}`,
      "",
      conflicts.length ? `Conflicting rules:\n- ${conflicts.join("\n- ")}` : "Conflicting rules: none detected",
      "",
      suggestions.length ? `Suggestions:\n- ${suggestions.join("\n- ")}` : "Suggestions: none",
    ].join("\n");

    await fetchAuthInfo();
    mountPanel();
  }

  async function refreshAll(forceRender = false) {
    if (!isActive) return;
    latestDraft = getDraft();
    await fetchAuthInfo();

    const nextHash = JSON.stringify({
      sub: latestDraft.subreddit,
      title: latestDraft.title,
      body: latestDraft.body,
      loggedIn: authInfo.isLoggedIn,
      credits: authInfo.credits,
      status: state.status,
      output: state.output,
    });

    if (forceRender || nextHash !== lastDraftHash) {
      lastDraftHash = nextHash;
      mountPanel();
    }
  }

  async function init() {
    try {
      const appBaseRes = await request("GET_APP_BASE_URL");
      appBaseUrl = (appBaseRes?.baseUrl || appBaseUrl).replace(/\/+$/, "");
    } catch (_e) {
      appBaseUrl = "https://www.unbannnable.com";
    }

    await refreshAll(true);

    domObserver = new MutationObserver(() => {
      refreshAll(false).catch(() => {});
    });

    domObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    pollTimer = setInterval(() => {
      refreshAll(false).catch(() => {});
    }, 1800);

    onFocus = () => {
      refreshAll(false).catch(() => {});
    };
    window.addEventListener("focus", onFocus);

    onInput = (event) => {
      const classified = classifyInputTarget(event?.target);
      if (classified?.kind === "title") {
        liveDraft.title = classified.text;
      } else if (classified?.kind === "body") {
        liveDraft.body = classified.text;
      }
      refreshAll(false).catch(() => {});
    };
    window.addEventListener("input", onInput, true);
  }

  init().catch(() => {});
})();
