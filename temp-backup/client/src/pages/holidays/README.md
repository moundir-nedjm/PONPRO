# Module des Jours Fériés Algériens

Ce module permet de visualiser et gérer les jours fériés algériens dans l'application POINTGEE.

## Fonctionnalités

- **Liste des jours fériés** : Affiche tous les jours fériés algériens avec leur date, description et type.
- **Vue calendrier** : Visualise les jours fériés dans un calendrier mensuel.
- **Version imprimable** : Génère une version imprimable du calendrier des jours fériés.
- **Filtrage par type** : Permet de filtrer les jours fériés par type (national, religieux, civil, culturel).
- **Détails des jours fériés** : Affiche des informations détaillées sur chaque jour férié.

## Composants

### 1. Holidays.js

Composant principal qui intègre les différentes vues des jours fériés. Il permet de basculer entre la vue liste et la vue calendrier.

### 2. AlgerianHolidays.js

Composant qui affiche la liste des jours fériés avec des fonctionnalités de filtrage et de détails.

### 3. HolidaysCalendar.js

Composant qui affiche les jours fériés dans un calendrier mensuel, permettant de naviguer entre les mois et les années.

### 4. HolidaysPrint.js

Composant qui génère une version imprimable du calendrier des jours fériés, organisée par mois.

## Types de jours fériés

- **National** (bleu) : Fêtes nationales comme la Fête de l'Indépendance.
- **Religieux** (vert) : Fêtes religieuses comme l'Aïd el-Fitr.
- **Civil** (rouge) : Fêtes civiles comme le Jour de l'an.
- **Culturel** (violet) : Fêtes culturelles comme Yennayer (Nouvel An Amazigh).

## Notes importantes

- Les dates des fêtes religieuses islamiques sont basées sur le calendrier lunaire et peuvent varier de 1 à 2 jours par rapport aux dates indiquées, en fonction de l'observation de la lune.
- Les dates pour les années futures sont approximatives et peuvent être mises à jour lorsque les dates officielles sont annoncées.

## Intégration avec d'autres modules

Ce module peut être intégré avec d'autres fonctionnalités de POINTGEE :

- **Module de pointage** : Pour tenir compte des jours fériés dans le calcul des présences.
- **Module de congés** : Pour éviter la planification de congés pendant les jours fériés.
- **Module de rapports** : Pour inclure les jours fériés dans les rapports de présence et d'absence.

## Maintenance

Pour ajouter ou modifier des jours fériés, mettez à jour la liste `holidays` dans les composants concernés. 