// Shared by backend/server.mjs (production) and vite.config.js (dev server)
// so the embeddability heuristic can't drift between the two.

// "host" here means hostname[:port], matching what a frame-ancestors source
// or X-Frame-Options ALLOW-FROM value identifies — port matters (e.g. a site
// that whitelists "http://localhost:5173" should not match ":3000").
function host(urlStr) {
  try {
    return new URL(urlStr).host.toLowerCase();
  } catch {
    return null;
  }
}

function sourceMatchesOrigin(source, originHost, targetHost) {
  const token = source.trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (!token) return false;
  if (token === "*") return true;
  if (token === "'none'" || token === "none") return false;
  if (token === "'self'" || token === "self") return !!originHost && originHost === targetHost;

  const bare = token.replace(/^https?:\/\//, "").split("/")[0];
  if (!originHost) return false;
  if (bare.startsWith("*.")) {
    const suffix = bare.slice(1); // ".example.com[:port]"
    return originHost === bare.slice(2) || originHost.endsWith(suffix);
  }
  return bare === originHost;
}

// requestOrigin: the origin the page will actually be iframed from (e.g. window.location.origin
// of the app), passed by the client since the server can't infer it from a same-origin fetch.
export function isEmbeddable({ xfo, csp, requestOrigin, targetUrl }) {
  const originHost = requestOrigin ? host(requestOrigin) : null;
  const targetHost = host(targetUrl);

  if (csp) {
    const match = csp.match(/frame-ancestors([^;]*)/i);
    if (match) {
      const sources = match[1].trim().split(/\s+/).filter(Boolean);
      const allowed = sources.length === 0 || sources.some((s) => sourceMatchesOrigin(s, originHost, targetHost));
      if (!allowed) return false;
    }
  }

  if (xfo) {
    const value = xfo.trim().toLowerCase();
    if (value === "deny") return false;
    if (value === "sameorigin") return !!originHost && originHost === targetHost;
    if (value.startsWith("allow-from")) {
      const allowHost = host(value.replace(/^allow-from/, "").trim());
      return !!originHost && originHost === allowHost;
    }
  }

  return true;
}
