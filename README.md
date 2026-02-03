# DOCUMENTATION TECHNIQUE : POCKETCOACH

**Projet :** Application Web Progressive (PWA) de Fitness
**Version :** 4.1
**Technologie :** Vanilla JS / Bootstrap 5 / PWA
**Date :** Février 2026

---

## 1. PRÉSENTATION ET PÉRIMÈTRE FONCTIONNEL

PocketCoach est une application web conçue pour répondre aux contraintes de la pratique sportive en autonomie. Son architecture "Offline-First" garantit une fiabilité totale, permettant une utilisation fluide même dans les infrastructures sportives dépourvues de couverture réseau (zones blanches).

L'application s'articule autour de quatre axes majeurs :

* **Gestion du Temps (Chronométrie) :** Un minuteur intelligent maintient l'écran actif (Wake Lock) et notifie la fin du repos par un retour haptique, évitant à l'utilisateur de manipuler son smartphone avec des mains humides.
* **Planification de Séance :** Un module de recherche connecté à l'API wger permet de construire une liste d'exercices personnalisée avec des objectifs chiffrés (Poids et Répétitions).
* **Continuité de Service :** Un système de sauvegarde instantanée conserve l'état de l'application. L'utilisateur retrouve sa séance à l'identique, même après une fermeture accidentelle du navigateur ou un redémarrage du téléphone.
* **Installation Native :** L'application est installable sur l'écran d'accueil et s'exécute en mode plein écran (standalone), supprimant les barres de navigation pour une immersion totale.

---

## 2. INTERFACE ET EXPÉRIENCE UTILISATEUR (UX)

### 2.1. Conception Mobile First
L'interface graphique repose sur le framework Bootstrap 5.3 et a été pensée pour une ergonomie tactile optimale :

* **Tableau de Bord :** Accès immédiat au chronomètre et aux contrôles principaux via des boutons larges (hauteur minimale 48px).
* **Navigation Contextuelle :** Intégration d'une zone de recherche qui permet d'ajouter des exercices sans perdre de vue la liste en cours.
* **Liste Dynamique :** Vue synthétique de la séance avec champs éditables directement (Inputs).

### 2.2. Adaptabilité (Responsive Design)
Grâce au système de grille réactive (Grid System), l'affichage s'adapte automatiquement :

* **Mobile :** Affichage empilé (Chrono en haut, Séance en bas).
* **Desktop :** Disposition en deux colonnes (Recherche à gauche / Séance active à droite).



---

## 3. STACK TECHNIQUE ET CHOIX D'IMPLÉMENTATION

### 3.1. APIs et Services Externes
Contrairement aux applications web classiques, PocketCoach minimise les dépendances externes pour maximiser la performance.

* **wger REST API :** Utilisée pour interroger la base de données d'exercices. Les appels sont gérés de manière asynchrone (async/await) avec une gestion d'erreur silencieuse (try/catch) pour ne pas bloquer l'interface en cas de coupure réseau.
* **Ressources Locales (No-CDN) :** Les polices d'icônes et les fichiers CSS sont hébergés physiquement dans l'architecture du projet. Aucun CDN (Content Delivery Network) n'est utilisé, garantissant un affichage correct même sans connexion internet.

### 3.2. Stratégie de Persistance (Stockage)
Le choix technique s'est porté sur le LocalStorage pour sa rapidité d'exécution sur des données textuelles légères.

* **Sérialisation :** L'objet JavaScript représentant la séance (tableau d'objets) est converti en chaîne JSON à chaque modification via `JSON.stringify()`.
* **Restauration :** Au chargement de la page, l'application lit cette chaîne, la vérifie et réhydrate le DOM automatiquement.

### 3.3. Interaction Matérielle (Hardware)
L'application exploite les APIs modernes du navigateur pour interagir avec le matériel du téléphone :

* **Screen Wake Lock API :** Une "sentinelle" est activée dès le lancement du chronomètre pour empêcher la mise en veille automatique du système d'exploitation.
* **Vibration API :** Un motif rythmique spécifique (200ms - 100ms - 200ms) est déclenché en fin de décompte pour alerter l'utilisateur sans contact visuel.

---

## 4. ARCHITECTURE LOGICIELLE



### 4.1. Organisation Modulaire
Le code source est scindé en fichiers distincts respectant la séparation des responsabilités :

* **Core (pwa.js) :** Gère le cycle de vie de l'application, l'installation et la détection des mises à jour.
* **Logique Métier (chrono.js) :** Encapsule l'algorithme de gestion du temps et le pilotage des capteurs matériels.
* **Gestion de Données (api.js) :** Centralise les appels réseaux (fetch) et les opérations de lecture/écriture dans le stockage local.
* **Proxy Réseau (service_worker.js) :** Script d'arrière-plan interceptant les requêtes HTTP pour servir le cache.

### 4.2. Modèle de Données
Les données sont structurées sous forme d'un tableau d'objets JSON standardisé :

```json
[
  {
    "nom": "Développé Couché",
    "series": "4",
    "reps": "10",
    "poids": "80"
  },
  {
    "nom": "Squat",
    "series": "4",
    "reps": "10",
    "poids": "100"
  }
]
