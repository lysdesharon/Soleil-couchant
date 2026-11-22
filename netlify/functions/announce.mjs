import webpush from 'web-push';
import { json, store, adminGate, clean, safeUrl, configureWebPush, listKeys, pool } from '../lib/common.mjs';

// Réservé à l'administration (en-tête x-admin-code).
// POST   { title, body, url? } : publie l'annonce dans l'application et envoie la notification
// DELETE { id }                : retire l'annonce de la liste (la notification déjà envoyée ne peut pas être rappelée)
export default async req => {
  const denied = await adminGate(req);
  if (denied) return denied;

  let data;
  try { data = await req.json(); } catch { return json({ error: 'Requête invalide.' }, 400); }
  const annStore = store('announcements');

  if (req.method === 'DELETE') {
    const list = (await annStore.get('list', { type: 'json' })) || [];
    await annStore.setJSON('list', list.filter(a => a.id !== data.id));
    return json({ ok: true });
  }
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);

  const title = clean(data.title, 80), body = clean(data.body, 400), url = safeUrl(data.url);
  if (!title || !body) return json({ error: 'Le titre et le message sont obligatoires.' }, 400);

  // 1) l'annonce apparaît dans l'application, même si une notification échoue
  const ann = { id: String(Date.now()), title, body, url, date: new Date().toISOString() };
  const list = (await annStore.get('list', { type: 'json' })) || [];
  await annStore.setJSON('list', [ann, ...list].slice(0, 30));

  // 2) notification à tous les téléphones inscrits
  await configureWebPush(new URL(req.url).origin);
  const subs = store('subscriptions');
  const keys = await listKeys(subs);
  const payload = JSON.stringify({ id: ann.id, title, body, url });
  const deadline = Date.now() + 8000;
  let sent = 0, failed = 0, removed = 0, skipped = 0;
  await pool(keys, 25, async key => {
    if (Date.now() > deadline) { skipped++; return; }
    const sub = await subs.get(key, { type: 'json' });
    if (!sub) return;
    try {
      await webpush.sendNotification(sub, payload, { TTL: 60 * 60 * 24 * 3, urgency: 'normal' });
      sent++;
    } catch (err) {
      if (err && (err.statusCode === 404 || err.statusCode === 410)) { await subs.delete(key); removed++; }
      else failed++;
    }
  });
  return json({ ok: true, id: ann.id, total: keys.length, sent, failed, removed, skipped });
};
