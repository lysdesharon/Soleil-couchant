# Ajouter une prédication à Soleil Couchant

Toutes les prédications de l'application sont listées dans `sermons.json`. Chaque personne qui ouvre l'application voit cette liste.

## Une entrée

```json
{
  "id": "2026-11-15-la-foi",
  "title": "La foi qui déplace les montagnes",
  "date": "2026-11-15",
  "yt": "ID_OU_LIEN_YOUTUBE",
  "audio": "audio/2026-11-15-la-foi.mp3",
  "transcript": "transcripts/2026-11-15-la-foi.vtt"
}
```

- `id` : un identifiant unique, sans espace (la date et un mot suffisent).
- `title` : le titre affiché.
- `date` : facultatif. La plus récente se met en premier dans la liste.
- `yt` : le lien ou l'identifiant YouTube (la vidéo). Facultatif.
- `audio` : le fichier audio (mp3), à placer dans le dossier `audio/`. Facultatif, mais **nécessaire pour le téléchargement hors ligne**.
- `transcript` : le texte, à placer dans le dossier `transcripts/`. Facultatif.

Une prédication peut avoir seulement une vidéo, seulement un audio, ou les trois. L'appli propose automatiquement les modes disponibles (Audio, Vidéo, Texte).

## Format du texte

- **Fichier `.vtt` (recommandé)** : le texte avance avec l'audio, la phrase en cours est surlignée, et on peut toucher une phrase pour y aller.
- **Fichier `.txt`** : du texte simple, paragraphes séparés par une ligne vide. Pas de synchronisation.

Exemple de `.vtt` :

```
WEBVTT

00:00.000 --> 00:08.000
Bienvenue dans cette prédication.

00:08.000 --> 00:16.000
Ouvrons nos Bibles ensemble.
```

## Où trouver l'audio et le texte

- **Audio** : la chaîne YouTube appartient au pasteur, donc l'équipe peut télécharger ses propres vidéos depuis YouTube Studio, ou reprendre les enregistrements d'origine de la sono. Pour garder des fichiers légers, un mp3 mono à 64 kbit/s donne environ 30 Mo par heure.
- **Texte** : à partir de l'audio, avec un outil de transcription (par exemple ElevenLabs Scribe ou Whisper), puis une relecture. Les sous-titres automatiques de YouTube ne sont pas assez fiables pour des prédications.

## Mise en ligne

Ajouter les fichiers dans le dépôt GitHub (dossiers `audio/` et `transcripts/`, puis la ligne dans `sermons.json`). Netlify republie le site automatiquement en une minute.

## Nouvelles vidéos : elles arrivent toutes seules

Les nouvelles vidéos de la chaîne YouTube sont ajoutées automatiquement dans l'application (voir `GUIDE-ADMINISTRATION.md`). Il n'est donc pas nécessaire de les copier ici. On n'ajoute une ligne dans `sermons.json` que pour une prédication qui doit avoir un audio ou un texte : on reprend alors le même identifiant `yt`, et l'application la fusionne avec la vidéo.

Les fichiers de sous-titres `.srt` sont aussi acceptés pour le texte, en plus de `.vtt`.
