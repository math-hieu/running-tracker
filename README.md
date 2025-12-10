# Running Tracker

Application de suivi d'activités de course à pied construite avec Next.js et Docker.

## Technologies

- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **NextUI** - Composants UI modernes
- **Tailwind CSS** - Styling
- **PostgreSQL** - Base de données
- **Prisma** - ORM
- **Strava API** - Import d'activités
- **Docker** - Conteneurisation

## Démarrage rapide

### Développement local

1. Installer les dépendances :
```bash
npm install
```

2. Créer le fichier d'environnement :
```bash
cp .env.example .env.local
```

3. Configurer l'API Strava (voir section Configuration Strava ci-dessous)

4. Démarrer PostgreSQL (avec Docker) :
```bash
docker-compose up postgres -d
```

5. Générer le client Prisma et appliquer les migrations :
```bash
npm run db:generate
npm run db:push
```

6. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### Avec Docker

1. Construire et lancer les conteneurs :
```bash
docker-compose up --build
```

2. L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

3. Pour arrêter les conteneurs :
```bash
docker-compose down
```

## Scripts disponibles

### Application
- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm start` - Démarre le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

### Base de données (Prisma)
- `npm run db:generate` - Génère le client Prisma
- `npm run db:push` - Synchronise le schéma avec la base de données
- `npm run db:migrate` - Crée et applique une migration
- `npm run db:studio` - Ouvre Prisma Studio (interface graphique)

## Structure du projet

```
running-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── activities/
│   │   │       └── route.ts    # API des activités
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Page d'accueil
│   │   └── globals.css         # Styles globaux
│   └── lib/
│       └── prisma.ts           # Client Prisma
├── prisma/
│   └── schema.prisma           # Schéma de la base de données
├── public/                     # Fichiers statiques
├── Dockerfile                  # Configuration Docker
├── docker-compose.yml          # Orchestration Docker
└── next.config.ts              # Configuration Next.js
```

## Modèle de données

### Activity
Représente une activité de course :
- `title` - Titre de l'activité
- `description` - Description optionnelle
- `distance` - Distance en kilomètres
- `duration` - Durée en secondes
- `pace` - Allure en min/km
- `date` - Date de l'activité
- `calories` - Calories brûlées (optionnel)
- `elevation` - Dénivelé en mètres (optionnel)
- `heartRate` - Fréquence cardiaque moyenne (optionnel)
- `route` - Données GPS du parcours au format GeoJSON (optionnel)

## API Endpoints

### GET /api/activities
Récupère les 10 dernières activités

### POST /api/activities
Crée une nouvelle activité

Exemple de body :
```json
{
  "title": "Course matinale",
  "description": "Belle course au parc",
  "distance": 5.2,
  "duration": 1800,
  "pace": 5.77,
  "date": "2024-12-09T08:00:00Z",
  "calories": 350,
  "elevation": 50,
  "heartRate": 145
}
```

## Configuration Strava

Pour importer vos activités depuis Strava, vous devez créer une application API :

1. Allez sur [Strava API Settings](https://www.strava.com/settings/api)
2. Créez une nouvelle application avec les informations suivantes :
   - **Application Name**: Running Tracker (ou le nom de votre choix)
   - **Category**: Training
   - **Club**: Laissez vide
   - **Website**: http://localhost:3000
   - **Authorization Callback Domain**: localhost
3. Une fois créée, copiez le **Client ID** et le **Client Secret**
4. Mettez à jour votre fichier `.env.local` :
   ```bash
   STRAVA_CLIENT_ID=votre_client_id
   STRAVA_CLIENT_SECRET=votre_client_secret
   STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
   ```

### Utilisation

1. Lancez l'application et cliquez sur "Se connecter avec Strava"
2. Autorisez l'accès à vos données Strava
3. Sélectionnez les activités que vous souhaitez importer
4. Cliquez sur "Importer" pour les ajouter à votre base de données

## Variables d'environnement

Voir `.env.example` pour la liste des variables d'environnement disponibles.
