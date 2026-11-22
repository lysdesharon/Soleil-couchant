# Guide d'administration de Soleil Couchant

## 1. Activer l'envoi d'annonces (une seule fois)

Les annonces demandent un **code secret** que toi seul connais.

1. Ouvre ton site sur Netlify, puis **Site configuration**, puis **Environment variables**.
2. Ajoute une variable :
   - Nom : `ADMIN_CODE`
   - Valeur : une phrase de passe longue, au moins 8 caractères (par exemple trois mots et un chiffre).
3. Va dans **Deploys**, puis **Trigger deploy**, puis **Deploy site**. Une nouvelle mise en ligne est nécessaire pour que le code soit pris en compte.
4. Quand c'est terminé, ouvre `https://TON-SITE.netlify.app/admin.html`. Entre le code : le nombre de téléphones inscrits s'affiche.

Les clés techniques des notifications se créent toutes seules au premier usage. Il n'y a rien d'autre à configurer.

## 2. Envoyer une annonce

Sur la page `admin.html` : tape le titre, le message, un lien si besoin, puis **Envoyer l'annonce**. Un second appui est demandé pour confirmer. L'annonce :

- apparaît dans la section **Annonces** de l'accueil de l'application, pour tout le monde,
- part en notification sur les téléphones qui ont activé les notifications.

On peut retirer une annonce de l'application avec **Retirer** (une notification déjà envoyée ne peut pas être rappelée). Ne partage pas l'adresse `admin.html` ni le code : toute personne qui les a peut envoyer des annonces.

## 3. Ce que les utilisateurs doivent faire

- **Android** : appuyer sur **Activer** dans le bandeau de l'accueil, puis **Autoriser**.
- **iPhone (iOS 16.4 ou plus)** : installer d'abord l'application (**Partager**, puis **Sur l'écran d'accueil**), l'ouvrir depuis l'icône, puis appuyer sur **Activer**. Sans installation, iPhone n'autorise pas les notifications.
- Ils peuvent les désactiver dans **Réglages**, puis **Notifications des annonces**.

## 4. Nouvelles vidéos de la chaîne YouTube

À chaque ouverture, l'application lit la liste des dernières vidéos publiques de la chaîne et ajoute les nouvelles en tête, avec l'étiquette **Nouveau** pendant 14 jours. Aucune clé YouTube n'est nécessaire.

- Seules les vidéos les plus récentes (une quinzaine) sont lues. Les plus anciennes viennent du fichier `sermons.json`.
- Les vidéos de type **Shorts** sont ignorées.
- La chaîne est retrouvée à partir de `@francistchinona`. Si besoin, on peut la fixer avec une variable Netlify `YOUTUBE_CHANNEL_ID` (identifiant commençant par `UC`).
- Une vidéo ajoutée ainsi n'a que la vidéo. Pour l'audio et le texte, voir `AJOUTER-UNE-PREDICATION.md` : on ajoute les fichiers et on complète la ligne dans `sermons.json` avec le même identifiant YouTube.

## 5. Limites à connaître

- L'envoi d'une annonce à plusieurs centaines de téléphones prend quelques secondes. Au-delà d'environ 8 secondes, l'envoi s'arrête et la page indique combien de téléphones n'ont pas été atteints.
- L'annonce reste visible dans l'application même si une notification échoue.
