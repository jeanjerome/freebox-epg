const PREFIX = 'epg:';
const ONE_DAY = 86400; // seconds

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch {
    return null;
  }
}

export function cacheSet(key, data, programEpoch) {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ data, programEpoch })
    );
  } catch {
    // localStorage full — silently ignore
  }
}

export function cleanExpiredCache() {
  const now = Date.now() / 1000;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    try {
      const { programEpoch } = JSON.parse(localStorage.getItem(key));
      if (programEpoch + ONE_DAY < now) {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}
