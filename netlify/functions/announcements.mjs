import { json, store } from '../lib/common.mjs';

// Liste publique des dernières annonces (affichées dans l'application).
export default async () => {
  try {
    const list = (await store('announcements').get('list', { type: 'json' })) || [];
    return json({ announcements: list }, 200, { 'cache-control': 'public, max-age=30' });
  } catch {
    return json({ announcements: [] }, 200);
  }
};
