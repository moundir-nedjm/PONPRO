# POINTGEE - Frontend

Ce répertoire contient le frontend de l'application POINTGEE, un système de pointage professionnel algérien.

## Technologies Utilisées

- React.js
- Material-UI
- React Router
- Formik & Yup
- Axios
- Chart.js

## Installation

1. Installez les dépendances:
   ```
   npm install
   ```

2. Démarrez l'application en mode développement:
   ```
   npm start
   ```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Structure du Projet

```
client/
├── public/              # Fichiers publics
├── src/                 # Code source
│   ├── assets/          # Ressources statiques (images, CSS)
│   ├── components/      # Composants réutilisables
│   ├── context/         # Contextes React (AuthContext, etc.)
│   ├── pages/           # Pages de l'application
│   ├── utils/           # Fonctions utilitaires
│   ├── App.js           # Composant principal
│   └── index.js         # Point d'entrée
└── package.json         # Dépendances et scripts
```

## Fonctionnalités

- **Authentification**: Connexion et inscription des utilisateurs
- **Tableau de Bord**: Vue d'ensemble des statistiques importantes
- **Gestion des Employés**: Liste, détails, ajout et modification des employés
- **Pointage**: Enregistrement des heures d'arrivée et de départ
- **Gestion des Congés**: Demande et suivi des congés
- **Rapports**: Génération de rapports détaillés

## Déploiement

Pour créer une version de production:

```
npm run build
```

Cette commande génère un dossier `build` avec les fichiers optimisés pour la production.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
