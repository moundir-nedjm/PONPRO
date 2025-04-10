# Guide d'Intégration Biométrique pour le Système de Pointage

Ce document explique comment intégrer et utiliser les différentes méthodes biométriques disponibles dans le système de pointage.

## Vue d'ensemble

Le système offre trois méthodes principales de pointage biométrique:
1. Reconnaissance Faciale
2. Empreinte Digitale
3. QR Code

Chaque méthode nécessite une configuration spécifique et un processus d'enregistrement des données biométriques des employés.

## 1. Reconnaissance Faciale

### Fonctionnement
La reconnaissance faciale utilise la caméra de l'appareil pour capturer l'image du visage de l'employé et la comparer aux modèles enregistrés dans la base de données.

### Configuration requise
- Caméra frontale sur l'appareil utilisé (ordinateur, tablette ou smartphone)
- Éclairage adéquat pour une capture d'image claire
- Base de données d'images faciales des employés

### Enregistrement des employés
Pour chaque employé, vous devez:
1. Accéder au profil de l'employé via le panneau d'administration
2. Sélectionner "Gérer les données biométriques"
3. Choisir l'option "Enregistrer le visage"
4. Prendre plusieurs photos du visage de l'employé sous différents angles et conditions d'éclairage
5. Valider l'enregistrement

### Configuration du backend
Le backend utilise un modèle de reconnaissance faciale pour comparer les images. Deux options sont disponibles:

#### Option 1: API de reconnaissance faciale locale
- Nécessite l'installation de la bibliothèque face-api.js ou tensorflow.js
- Plus rapide car traitement local, mais moins précis
- Configuration dans `server/config/biometrics.config.js`

#### Option 2: Service cloud (recommandé)
- Utilise Azure Face API, AWS Rekognition ou Google Cloud Vision
- Plus précis mais nécessite une connexion internet
- Nécessite une clé API configurée dans les variables d'environnement

## 2. Empreinte Digitale

### Fonctionnement
Le système utilise un lecteur d'empreintes digitales connecté pour identifier l'employé.

### Configuration requise
- Lecteur d'empreintes digitales compatible (USB ou Bluetooth)
- Pilotes du lecteur installés sur l'appareil
- Base de données d'empreintes digitales des employés

### Modèles de lecteurs supportés
- Digital Persona U.are.U 4500
- Suprema BioMini
- ZKTeco ZK4500
- HID DigitalPersona 5160

### Enregistrement des employés
Pour chaque employé, vous devez:
1. Accéder au profil de l'employé via le panneau d'administration
2. Sélectionner "Gérer les données biométriques"
3. Choisir l'option "Enregistrer l'empreinte digitale"
4. Demander à l'employé de placer son doigt sur le lecteur (généralement l'index droit)
5. Répéter la capture 3 fois pour améliorer la précision
6. Stocker le modèle d'empreinte dans la base de données

### Configuration du backend
- Installation du SDK approprié pour le modèle de lecteur
- Configuration dans `server/config/fingerprint.config.js`
- Mise en place de la sécurité pour le stockage des modèles biométriques

## 3. QR Code

### Fonctionnement
Cette méthode génère un QR code unique pour chaque employé, qui peut être scanné pour enregistrer leur présence.

### Configuration requise
- Caméra sur l'appareil pour scanner les QR codes
- Imprimante pour les badges QR code (optionnel)
- Application mobile pour QR codes dynamiques (optionnel)

### Génération des QR codes
Pour chaque employé, vous pouvez:
1. Accéder au profil de l'employé via le panneau d'administration
2. Sélectionner "Gérer les données biométriques"
3. Choisir l'option "Générer QR code"
4. Sélectionner le type de QR code:
   - Statique: code permanent pour l'employé
   - Dynamique: code qui change périodiquement (plus sécurisé)
5. Imprimer le QR code ou l'envoyer par email à l'employé

### Options de déploiement
1. **QR codes imprimés**: Chaque employé reçoit une carte d'identité avec son QR code
2. **Application mobile**: Les employés peuvent générer des QR codes via l'application mobile
3. **QR codes temporaires**: Codes à usage unique ou valides pour une durée limitée

## Sécurité et conformité RGPD

### Stockage des données biométriques
- Les données biométriques sont chiffrées dans la base de données
- Option pour stocker uniquement les modèles (templates) et non les données brutes
- Conformité avec les réglementations RGPD sur le consentement et le stockage

### Consentement des employés
Avant d'enregistrer les données biométriques, vous devez:
1. Obtenir le consentement explicite de l'employé
2. Expliquer comment les données seront utilisées et stockées
3. Fournir une option alternative pour les employés qui ne souhaitent pas utiliser la biométrie

## Configuration des scanners dans l'interface

Les scanners biométriques sont configurés dans les fichiers suivants:
- `client/src/components/attendance/FaceScanner.js` - Scanner facial
- `client/src/components/attendance/FingerprintScanner.js` - Scanner d'empreintes
- `client/src/components/attendance/QrCodeScanner.js` - Scanner QR code

Les paramètres de configuration sont dans `client/src/config/biometrics.config.js`.

## API Backend

Le backend expose les endpoints suivants pour la gestion biométrique:

```
POST /api/biometrics/register-face
POST /api/biometrics/register-fingerprint
POST /api/biometrics/generate-qrcode
POST /api/attendance/face-check-in
POST /api/attendance/face-check-out
POST /api/attendance/fingerprint-check-in
POST /api/attendance/fingerprint-check-out
POST /api/attendance/qrcode-check-in
POST /api/attendance/qrcode-check-out
```

Consultez la documentation API complète pour plus de détails sur ces endpoints. 