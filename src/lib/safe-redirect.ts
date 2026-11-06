/**
 * Post-login destinations come from the ?redirect= query string, which anyone can
 * put in a link. Only same-site paths are allowed, so a crafted login link cannot
 * send a signed-in user to another site.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value) return fallback
  // Must be a root-relative path. Rejects absolute URLs, protocol-relative //host,
  // backslash variants browsers treat as //host, and userinfo tricks like @host.
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback
  try {
    const base = 'https://carbonbridge.invalid'
    const url = new URL(value, base)
    if (url.origin !== base) return fallback
    // Re-check after normalisation: "/..//evil.example" resolves to "//evil.example".
    const out = url.pathname + url.search + url.hash
    return out.startsWith('//') || out.startsWith('/\\') ? fallback : out
  } catch {
    return fallback
  }
}
