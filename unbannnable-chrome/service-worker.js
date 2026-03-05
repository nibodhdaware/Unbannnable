const DEFAULT_APP_BASE_URL = "https://www.unbannnable.com";

function normalizeAppBaseUrl(raw) {
  if (!raw || typeof raw !== "string") return DEFAULT_APP_BASE_URL;
  return raw.replace(/\/+$/, "");
}

async function getAppBaseUrl() {
  const { appBaseUrl } = await chrome.storage.sync.get("appBaseUrl");
  return normalizeAppBaseUrl(appBaseUrl);
}

function normalizeCookieDomain(hostname) {
  return hostname.replace(/^www\./, "");
}

async function getSessionTokenForBaseUrl(baseUrl) {
  try {
    const url = new URL(baseUrl);
    const domain = normalizeCookieDomain(url.hostname);
    const candidates = await chrome.cookies.getAll({ domain });
    const sessionCookie =
      candidates.find((c) => c.name === "__session") ||
      candidates.find((c) => c.name.startsWith("__session")) ||
      null;
    return sessionCookie?.value || null;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) return;

  if (message.type === "GET_APP_BASE_URL") {
    getAppBaseUrl()
      .then((baseUrl) => sendResponse({ baseUrl }))
      .catch(() => sendResponse({ baseUrl: DEFAULT_APP_BASE_URL }));
    return true;
  }

  if (message.type === "API_REQUEST") {
    Promise.resolve(message.baseUrl ? normalizeAppBaseUrl(message.baseUrl) : getAppBaseUrl())
      .then(async (baseUrl) => {
        const path = message.path || "/";
        const method = message.method || "GET";
        const headers = {
          "Content-Type": "application/json",
          ...(message.sessionToken
            ? { "x-clerk-session-token": message.sessionToken }
            : {}),
          ...(message.headers || {}),
        };

        const response = await fetch(`${baseUrl}${path}`, {
          method,
          headers,
          credentials: "include",
          body: message.body ? JSON.stringify(message.body) : undefined,
        });

        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
          ? await response.json()
          : await response.text();

        sendResponse({
          ok: response.ok,
          status: response.status,
          payload,
        });
      })
      .catch((error) =>
        sendResponse({
          ok: false,
          status: 500,
          payload: { error: error?.message || "Request failed" },
        }),
      );

    return true;
  }

  if (message.type === "GET_SESSION_TOKEN") {
    Promise.resolve(message.baseUrl ? normalizeAppBaseUrl(message.baseUrl) : getAppBaseUrl())
      .then((baseUrl) => getSessionTokenForBaseUrl(baseUrl))
      .then((sessionToken) => sendResponse({ ok: true, sessionToken }))
      .catch((error) => sendResponse({ ok: false, error: error?.message || "Failed to read token" }));
    return true;
  }

  if (message.type === "SET_APP_BASE_URL") {
    const baseUrl = normalizeAppBaseUrl(message.baseUrl);
    chrome.storage.sync
      .set({ appBaseUrl: baseUrl })
      .then(() => sendResponse({ ok: true, baseUrl }))
      .catch((error) =>
        sendResponse({ ok: false, error: error?.message || "Failed to save base URL" }),
      );
    return true;
  }

  if (message.type === "OPEN_DEEP_ANALYSIS") {
    getAppBaseUrl()
      .then((baseUrl) => {
        const params = new URLSearchParams({
          subreddit: message.payload?.subreddit || "",
          title: message.payload?.title || "",
          body: message.payload?.body || "",
          autoAnalyze: "1",
          source: "chrome-extension",
        });

        return chrome.tabs.create({
          url: `${baseUrl}/app?${params.toString()}`,
        });
      })
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error?.message }));

    return true;
  }
});
