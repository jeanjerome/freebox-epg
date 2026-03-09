<p align="center">
  <img src="public/logo.png" alt="Guide TV Freebox" width="400" />
</p>

# freebox-epg

Guide des programmes TV pour Freebox : une application web qui affiche la grille des programmes des chaînes de la TNT française en s'appuyant sur l'API locale de la Freebox.

## Fonctionnalités

- **Grille EPG interactive** : Affichage des programmes sur une fenêtre de 3 heures avec une règle temporelle et un marqueur "en direct"
- **23 chaînes TNT** : TF1, France 2, France 3, France 5, M6, Arte, C8, W9, TMC, TFX, NRJ 12, France 4, BFM TV, CNews, CStar, Gulli, TF1 SF, L'Equipe, 6ter, RMC Story, RMC Découverte
- **Navigation temporelle** : Créneaux rapides (matin, midi, après-midi, soirée, nuit), navigation jour par jour, bouton "Maintenant"
- **Notes des films** : Détection automatique des films et récupération des notes TMDb, IMDb, Rotten Tomatoes et Metascore
- **Fiche détaillée** : Synopsis, casting, affiches, notes agrégées, récompenses et lien IMDb au clic sur un programme
- **Suivi en direct** : Barre de progression sur les programmes en cours de diffusion

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- Être connecté au réseau local d'une **Freebox** (pour accéder à `mafreebox.freebox.fr`)

## Installation

```bash
npm install
```

## Configuration

Copier le fichier `.env.sample` en `.env` et renseigner les clés API :

```bash
cp .env.sample .env
```

| Variable | Description | Obtenir une clé |
|----------|-------------|-----------------|
| `VITE_TMDB_API_KEY` | Clé API TMDb | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `VITE_OMDB_API_KEY` | Clé API OMDb | [omdbapi.com](https://www.omdbapi.com/apikey.aspx) |

> **Ces clés sont optionnelles.** L'application fonctionne sans elles en affichant uniquement les données Freebox (titre, synopsis, casting, horaires). Chaque clé enrichit indépendamment l'expérience :

**TMDb** apporte :
- Affiche du film en haute qualité (poster portrait), utilisée dans une mise en page deux colonnes dans la fiche détaillée
- Image panoramique (backdrop) pour les films disposant d'une image de couverture
- Note TMDb avec nombre de votes
- Année de sortie du film

**OMDb** apporte :
- Note IMDb avec nombre de votes et lien cliquable vers la fiche IMDb
- Score Rotten Tomatoes
- Metascore
- Récompenses (Oscars, nominations, etc.)
- Réalisateur et acteurs en fallback si le casting Freebox est absent

**Avec les deux clés**, la grille affiche les étoiles (moyenne pondérée de toutes les sources) et l'année à côté de chaque film. La fiche détaillée présente l'affiche en colonne gauche, quatre badges de notes, les récompenses et un casting complet.

## Utilisation

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`. Le serveur de développement Vite redirige les appels API vers la Freebox via un proxy local.

### Autres commandes

| Commande | Description |
|----------|-------------|
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |

## Cache

Les réponses de l'API Freebox et des services de notes (TMDb, OMDb) sont mises en cache dans le `localStorage` du navigateur pendant **24 heures**. L'objectif principal est de **limiter la consommation des quotas journaliers** des clés API TMDb et OMDb : les données d'un programme déjà consulté sont réutilisées sans nouvel appel réseau. Les entrées expirées sont automatiquement purgées au démarrage de l'application.

## Stack technique

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 7
- [Tailwind CSS](https://tailwindcss.com/) 4
- API Freebox TV (`/api/v3/tv`)
- [TMDB](https://www.themoviedb.org/) & [OMDB](https://www.omdbapi.com/) pour les notes

## Architecture

```
src/
├── api/
│   ├── cache.js             # Cache localStorage avec expiration 24h
│   ├── freebox.js           # Client API Freebox (chaînes, EPG, détails)
│   └── ratings.js           # Service de notes TMDb / OMDb (poster, backdrop, notes, awards)
├── components/
│   ├── ChannelRow.jsx       # Ligne d'une chaîne avec ses programmes
│   ├── ProgramCard.jsx      # Carte d'un programme (titre, horaire, note, année)
│   ├── ProgramDetail.jsx    # Modal détail (layout poster 2 colonnes / standard)
│   ├── TimeSlotGrid.jsx     # Grille EPG avec règle temporelle et marqueur direct
│   └── TimeSlotNav.jsx      # Barre de navigation date/créneau/maintenant
├── config/
│   └── channels.js          # Liste des 23 chaînes TNT
├── App.jsx                  # Composant racine, état global et chargement des notes
├── main.jsx                 # Point d'entrée React
└── index.css                # Import Tailwind
```

## Licence

Usage personnel. Ce projet s'appuie sur l'API locale de la Freebox (non documentée publiquement) et sur les APIs TMDb et OMDb dont les conditions d'utilisation limitent l'usage à des fins non commerciales. Il n'est pas destiné à être distribué ni déployé publiquement.
