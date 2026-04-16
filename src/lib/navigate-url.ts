/**
 * Turn address-bar text into an https URL for the IE iframe, or a search URL.
 * Pass `siteOrigin` so paths like `/about` resolve to this app’s origin.
 */
export function resolveAddressBarInput(
  raw: string,
  siteOrigin?: string
): { ok: true; url: string } | { ok: false } {
  const t = raw.trim();
  if (t === "" || /^about:home$/i.test(t) || /^about:blank$/i.test(t)) {
    return { ok: true, url: "about:home" };
  }
  if (/^about:blog$/i.test(t)) {
    return { ok: true, url: "about:blog" };
  }

  /* Same-site path — reliable in iframe (must be resolved to absolute URL). */
  if (t.startsWith("/") && !t.startsWith("//") && t.length > 1) {
    if (!siteOrigin) return { ok: false };
    return { ok: true, url: `${siteOrigin}${t}` };
  }

  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false };
      if (u.protocol === "http:") u.protocol = "https:";
      return { ok: true, url: u.href };
    } catch {
      return { ok: false };
    }
  }

  if (/\s/.test(t)) {
    return {
      ok: true,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(t)}`,
    };
  }

  const hostish = t.replace(/^\/+/, "");
  if (
    hostish.length > 0 &&
    /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}([/:?#].*)?$/i.test(hostish)
  ) {
    try {
      const u = new URL(`https://${hostish}`);
      return { ok: true, url: u.href };
    } catch {
      /* fall through */
    }
  }

  /* One word → apex domain (e.g. github → https://github.com). Many sites omit www. */
  if (/^[a-z0-9][a-z0-9-]*$/i.test(t)) {
    return { ok: true, url: `https://${t.toLowerCase()}.com` };
  }

  return {
    ok: true,
    url: `https://duckduckgo.com/?q=${encodeURIComponent(t)}`,
  };
}
