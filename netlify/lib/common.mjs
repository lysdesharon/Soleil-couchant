// Code partagé par les fonctions Netlify de Soleil Couchant.
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';
import crypto from 'node:crypto';

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
  });

// Stockage Netlify Blobs. `globalThis.__scStore` sert uniquement aux tests.
export const store = name =>
  globalThis.__scStore ? globalThis.__scStore(name) : getStore({ name, consistency: 'strong' });

/* ---------- clés VAPID : créées une fois, gardées dans le stockage du site ---------- */
export async function vapidKeys() {
  const s = store('config');
  let k = await s.get('vapid', { type: 'json' });
  if (!k) {
    await s.setJSON('vapid', webpush.generateVAPIDKeys());
    k = await s.get('vapid', { type: 'json' });   // relecture : si deux requêtes se croisent, tout le monde utilise la même
  }
  return k;
}
export async function configureWebPush(origin) {
  const k = await vapidKeys();
  webpush.setVapidDetails(origin || 'https://example.com', k.publicKey, k.privateKey);
  return k;
}

/* ---------- accès administrateur : code secret dans la variable ADMIN_CODE ---------- */
export const adminConfigured = () => (process.env.ADMIN_CODE || '').length >= 8;
export function isAdmin(req) {
  if (!adminConfigured()) return false;
  const given = req.headers.get('x-admin-code') || '';
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(process.env.ADMIN_CODE).digest();
  return crypto.timingSafeEqual(a, b);
}
export async function adminGate(req) {
  if (!adminConfigured()) return json({ error: 'Le code administrateur n\'est pas encore configuré sur Netlify (variable ADMIN_CODE, 8 caractères minimum).' }, 503);
  if (!isAdmin(req)) { await new Promise(r => setTimeout(r, globalThis.__scNoDelay ? 0 : 1200)); return json({ error: 'Code incorrect.' }, 401); }
  return null;
}

/* ---------- abonnements ---------- */
const OK_HOSTS = [/(^|\.)googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /(^|\.)notify\.windows\.com$/, /(^|\.)push\.apple\.com$/];
export function validSubscription(s) {
  if (!s || typeof s !== 'object') return null;
  const endpoint = String(s.endpoint || '');
  const p256dh = s.keys && s.keys.p256dh, auth = s.keys && s.keys.auth;
  if (endpoint.length > 600 || !/^[\w-]{40,200}$/.test(p256dh || '') || !/^[\w-]{12,40}$/.test(auth || '')) return null;
  let u; try { u = new URL(endpoint); } catch { return null; }
  if (u.protocol !== 'https:' || !OK_HOSTS.some(r => r.test(u.hostname))) return null;
  return { endpoint, keys: { p256dh, auth } };
}
export const subKey = endpoint => crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 40);

export async function listKeys(s) {
  const out = [];
  for await (const page of s.list({ paginate: true })) for (const b of page.blobs) out.push(b.key);
  return out;
}
export async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) await fn(items[i++]);
  }));
}

/* ---------- texte saisi par l'administrateur ---------- */
export const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export const safeUrl = v => { const u = clean(v, 300); return /^https?:\/\/\S+$/i.test(u) ? u : ''; };

/* ---------- flux YouTube ---------- */
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
export function cleanTitle(t) {
  t = decode(String(t)).trim();
  const parts = t.split(/\s*[|｜]\s*/);
  if (parts.length > 1 && parts.slice(1).some(p => /tchinona|tinona|soleil couchant/i.test(p))) t = parts[0];
  return t.trim();
}
export function parseFeed(xml) {
  const out = [];
  for (const m of String(xml).matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const id = (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1];
    const title = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const published = (e.match(/<published>([^<]+)<\/published>/) || [])[1];
    const link = (e.match(/<link[^>]+href="([^"]+)"/) || [])[1] || '';
    if (!id || !title || /\/shorts\//.test(link)) continue;   // on laisse de côté les « Shorts »
    out.push({ id, yt: id, title: cleanTitle(title), date: published ? published.slice(0, 10) : '' });
  }
  return out;
}
export function findChannelId(html) {
  const m = String(html).match(/"(?:channelId|externalId|browseId)":"(UC[\w-]{22})"/) || String(html).match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  return m ? m[1] : null;
}
