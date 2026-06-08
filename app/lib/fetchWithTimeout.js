/**
 * Crawler-safe fetch wrapper.
 * - Adds a timeout so slow APIs never hang Screaming Frog / Googlebot
 * - Retries once on network-level failures
 * - Always returns null instead of throwing
 */

const DEFAULT_TIMEOUT_MS = 8000;
const RETRY_TIMEOUT_MS = 5000;

export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    // Retry once with a shorter timeout
    if (err?.name !== "AbortError") {
      try {
        const controller2 = new AbortController();
        const timer2 = setTimeout(() => controller2.abort(), RETRY_TIMEOUT_MS);
        const res = await fetch(url, { ...options, signal: controller2.signal });
        clearTimeout(timer2);
        return res;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Fetch JSON safely — never throws.
 * Returns { data, ok, status } or { data: null, ok: false, status: 0 } on failure.
 */
export async function fetchJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    const res = await fetchWithTimeout(url, options, timeoutMs);
    if (!res || !res.ok) {
      console.warn(`[fetchJson] Failed: ${url} status=${res?.status ?? "timeout"}`);
      return { data: null, ok: false, status: res?.status ?? 0 };
    }
    const data = await res.json();
    return { data, ok: true, status: res.status };
  } catch (err) {
    console.error(`[fetchJson] Error: ${url}`, err?.message ?? err);
    return { data: null, ok: false, status: 0 };
  }
}
