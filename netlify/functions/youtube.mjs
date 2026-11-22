import { json, store, parseFeed, findChannelId } from '../lib/common.mjs';

// Lit le flux public de la chaîne YouTube (aucune clé nécessaire) et renvoie les dernières vidéos.
// La chaîne est retrouvée à partir de son nom @francistchinona ; on peut la fixer avec la variable
// YOUTUBE_CHANNEL_ID (commence par UC) si besoin.
const HANDLE = process.env.YOUTUBE_HANDLE || 'francistchinona';
const UA = 'Mozilla/5.0 (compatible; SoleilCouchant/1.0)';
const get = url => fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'fr', cookie: 'CONSENT=YES+1' }, signal: AbortSignal.timeout(6000) });

async function channelId(cfg) {
  if (process.env.YOUTUBE_CHANNEL_ID) return process.env.YOUTUBE_CHANNEL_ID;
  let id = await cfg.get('channelId');
  if (id) return id;
  const r = await get(`https://www.youtube.com/@${HANDLE}`);
  id = findChannelId(await r.text());
  if (id) await cfg.set('channelId', id);
  return id;
}

export default async () => {
  const cfg = store('config');
  try {
    const id = await channelId(cfg);
    if (!id) throw new Error('chaîne introuvable');
    const r = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    if (!r.ok) throw new Error('flux ' + r.status);
    const videos = parseFeed(await r.text());
    if (!videos.length) throw new Error('flux vide');
    await cfg.setJSON('videos', videos);
    return json({ videos }, 200, { 'cache-control': 'public, max-age=300' });
  } catch {
    // YouTube indisponible : on renvoie la dernière liste connue
    const last = await cfg.get('videos', { type: 'json' }).catch(() => null);
    return json({ videos: last || [], stale: true }, last ? 200 : 502, { 'cache-control': 'no-store' });
  }
};
