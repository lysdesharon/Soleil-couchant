import { json, store, adminConfigured, isAdmin, listKeys } from '../lib/common.mjs';

// Sans code : dit seulement si l'administration est configurée.
// Avec le code administrateur : nombre de téléphones inscrits et d'annonces.
export default async req => {
  const base = { adminConfigured: adminConfigured() };
  if (!isAdmin(req)) return json(base);
  const subscribers = (await listKeys(store('subscriptions'))).length;
  const list = (await store('announcements').get('list', { type: 'json' })) || [];
  return json({ ...base, authorized: true, subscribers, announcements: list });
};
