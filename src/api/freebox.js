import { cacheGet, cacheSet } from './cache';

const BASE_URL = '/api/v3/tv';

async function fetchApi(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.msg || 'API returned error');
  return data.result;
}

export function getChannels() {
  return fetchApi('/channels');
}

export async function getEpgByTime(epoch) {
  const key = `by_time:${epoch}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const result = await fetchApi(`/epg/by_time/${epoch}`);
  cacheSet(key, result, epoch);
  return result;
}

export function getEpgByChannel(channelUuid, epoch) {
  return fetchApi(`/epg/by_channel/${encodeURIComponent(channelUuid)}/${epoch}`);
}

export async function getProgramDetails(programId) {
  const key = `program:${programId}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const result = await fetchApi(`/epg/programs/${programId}`);
  cacheSet(key, result, Date.now() / 1000);
  return result;
}

const FREEBOX_ORIGIN = 'http://mafreebox.freebox.fr';

export function imageUrl(path, size = 'big') {
  if (!path) return null;
  if (path.startsWith(FREEBOX_ORIGIN)) {
    path = path.slice(FREEBOX_ORIGIN.length);
  }
  if (size === 'big') {
    return path.replace('/100x77/', '/168x130/');
  }
  return path;
}
