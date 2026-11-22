import { json, store, validSubscription, subKey } from '../lib/common.mjs';

// POST   { subscription }  : inscrit ce téléphone aux notifications
// DELETE { endpoint }      : le retire
export default async req => {
  const subs = store('subscriptions');
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Requête invalide.' }, 400); }

  if (req.method === 'POST') {
    const sub = validSubscription(body && body.subscription);
    if (!sub) return json({ error: 'Abonnement invalide.' }, 400);
    await subs.setJSON(subKey(sub.endpoint), { ...sub, created: new Date().toISOString() });
    return json({ ok: true });
  }
  if (req.method === 'DELETE') {
    const endpoint = String((body && body.endpoint) || '');
    if (endpoint.length > 600) return json({ error: 'Requête invalide.' }, 400);
    await subs.delete(subKey(endpoint));
    return json({ ok: true });
  }
  return json({ error: 'Méthode non autorisée.' }, 405);
};
