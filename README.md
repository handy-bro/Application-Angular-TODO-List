# 📝 TodoApp

Une application de gestion de tâches moderne construite avec Angular 19 et Material Design.

## ✨ Fonctionnalités

- 📋 Gestion complète des tâches (CRUD)
- 🏷️ Organisation par labels et priorités
- 👥 Attribution de tâches aux personnes
- 🔍 Filtrage et recherche avancés
- 📱 Interface responsive (Desktop & Mobile)
- 📊 Export des données (Excel & PDF)
- 🌐 Support multilingue
- 🎨 Thème Material Design personnalisé

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18 ou supérieure)
- npm (version 9 ou supérieure)
- Angular CLI (version 19.2.6)

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/todo-app.git
cd todo-app
```

2. Installez les dépendances :
```bash
npm install
```

3. Démarrez le serveur JSON (base de données mock) :
```bash
npm run start:database
```

4. Dans un nouveau terminal, lancez l'application :
```bash
npm start
```

L'application sera accessible à l'adresse `http://localhost:4200/`

## 🛠️ Technologies utilisées

- **Frontend** :
  - Angular 19
  - Angular Material
  - TailwindCSS
  - RxJS
  - Transloco (internationalisation)

- **Backend Mock** :
  - json-server

- **Outils d'export** :
  - XLSX (Excel)
  - jsPDF (PDF)

## 📁 Structure du projet

```
todo-app/
├── src/
│   ├── app/
│   │   ├── core/           # Services, modèles, guards
│   │   ├── features/       # Modules fonctionnels
│   │   ├── shared/         # Composants partagés
│   │   └── db/            # Base de données mock
│   ├── assets/            # Images, fonts, etc.
│   └── environments/      # Configuration par environnement
```

## 🔧 Scripts disponibles

- `npm start` : Lance l'application en mode développement
- `npm run start:database` : Démarre la base de données mock
- `npm run build` : Compile l'application pour la production
- `npm test` : Execute les tests unitaires
- `npm run watch` : Compilation en mode watch

## 📱 Fonctionnalités détaillées

### Gestion des tâches
- Création, modification et suppression de tâches
- Attribution de priorités (Facile, Moyen, Difficile)
- Ajout de labels personnalisés
- Dates de début et de fin
- Statut de progression

### Filtrage et recherche
- Recherche textuelle globale
- Filtrage par :
  - Priorité
  - Labels
  - Personne assignée
  - Statut

### Export de données
- Export Excel avec formatage
- Export PDF avec mise en page personnalisée

## 🌐 Internationalisation

L'application supporte plusieurs langues :
- 🇫🇷 Français
- 🇬🇧 Anglais

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📫 Contact

Handy Melong - handymelong237@gmail.com

Lien du projet : [https://github.com/handy-bro/Application-Angular-TODO-List](https://github.com/handy-bro/Application-Angular-TODO-List)
