import { json, vapidKeys } from '../lib/common.mjs';

// Clé publique que l'application utilise pour s'abonner aux notifications.
export default async () => {
  try {
    const { publicKey } = await vapidKeys();
    return json({ publicKey }, 200, { 'cache-control': 'public, max-age=3600' });
  } catch {
    return json({ error: 'Notifications indisponibles pour le moment.' }, 503);
  }
};
