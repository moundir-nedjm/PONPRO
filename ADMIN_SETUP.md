# Configuration de l'Administrateur Système

Ce document explique comment configurer le compte administrateur pour POINPRO.

## Compte Administrateur Principal

Un compte administrateur a été préconfigurée avec les identifiants suivants :

- **Email**: moundir@nedjm-froid.com
- **Mot de passe**: nedjmfroid1999

Ce compte a des privilèges d'administrateur complets et peut être utilisé pour gérer tous les aspects du système, notamment:
- Créer d'autres comptes utilisateurs (administrateurs, chefs de projet, employés)
- Gérer les projets
- Configurer les paramètres du système

## Comment initialiser le compte administrateur

Exécutez la commande suivante depuis la racine du projet pour créer ou mettre à jour le compte administrateur:

```bash
npm run seed:admin
```

Cette commande va:
- Vérifier si le compte admin existe déjà
- Si le compte existe, mettre à jour le mot de passe
- Si le compte n'existe pas, créer un nouveau compte admin avec les identifiants spécifiés

## Après l'initialisation

1. Connectez-vous au système en utilisant l'email et le mot de passe de l'administrateur
2. Accédez à la page "Gestion des Utilisateurs" depuis le panneau d'administration
3. Créez des comptes pour les chefs de projet et les employés selon les besoins

## Sécurité

Pour des raisons de sécurité, il est recommandé de :
1. Changer le mot de passe administrateur après la première connexion
2. Créer des comptes administrateurs individuels pour chaque administrateur système
3. Limiter le nombre de comptes ayant des privilèges d'administrateur

## Support

En cas de problèmes avec le compte administrateur, vous pouvez:
1. Réexécuter la commande `npm run seed:admin` pour réinitialiser le mot de passe
2. Vérifier les logs du serveur pour les erreurs potentielles
3. Contacter l'équipe de support technique 