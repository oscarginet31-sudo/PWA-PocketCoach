Documentation Technique : PocketCoach
PocketCoach est une PWA conçue pour répondre aux contraintes spécifiques de la pratique sportive en autonomie. Son architecture "Offline-First" garantit une fiabilité totale, permettant une utilisation fluide même dans les infrastructures sportives dépourvues de couverture réseau (zones blanches).
1. Périmètre Fonctionnel
L'application s'articule autour de quatre axes majeurs pour assister le sportif :
•	Gestion du Temps (Chronométrie) : Un minuteur intelligent qui maintient l'écran actif et notifie la fin du repos par un retour haptique, évitant à l'utilisateur de manipuler son smartphone.
•	Planification de Séance : Un module de recherche connecté à la base de données ouverte wger, permettant de construire une liste d'exercices personnalisée avec des objectifs chiffrés (Poids et Répétitions).
•	Continuité de Service : Un système de sauvegarde instantanée de l'état de l'application. L'utilisateur retrouve sa séance à l'identique, même après une fermeture accidentelle du navigateur ou un redémarrage du téléphone.
•	Installation Native : L'application est installable sur l'écran d'accueil et s'exécute en mode plein écran, supprimant les barres de navigation du navigateur pour une immersion totale.
2. Interface et Expérience Utilisateur
Conception Mobile First
L'interface graphique repose sur le framework Bootstrap 5.3 et a été pensée pour une ergonomie tactile optimale :
•	Tableau de Bord : Accès immédiat au chronomètre et aux contrôles principaux via des boutons larges.
•	Navigation Latérale : Intégration d'une zone de recherche qui permet d'ajouter des exercices sans perdre de vue la liste en cours.
•	Liste Dynamique : Vue synthétique de la séance avec champs éditables directement.
 

Grâce au système de grille réactive (Grid System), l'affichage s'adapte automatiquement sur les écrans larges en basculant sur une disposition en deux colonnes : la recherche à gauche et la séance active à droite.
3. Stack Technique et Choix d'Implémentation
APIs et Services Externes
Contrairement aux applications web classiques, PocketCoach minimise les dépendances externes pour maximiser la performance et l'autonomie.
•	wger REST API : Utilisée pour interroger la base de données d'exercices via le endpoint de recherche. Les appels sont gérés de manière asynchrone (async/await) avec une gestion d'erreur silencieuse pour ne pas bloquer l'interface en cas de coupure réseau.
•	Ressources Locales : Les polices d'icônes et les fichiers CSS sont hébergés physiquement dans l'architecture du projet. Aucun CDN (Content Delivery Network) n'est utilisé, garantissant un affichage correct même sans connexion internet.
Stratégie de Persistance (Stockage)
Le choix technique s'est porté sur le LocalStorage pour sa rapidité d'exécution sur des données textuelles légères.
•	Sérialisation : L'objet JavaScript représentant la séance (tableau d'objets) est converti en chaîne JSON à chaque modification via JSON.stringify().
•	Restauration : Au chargement de la page, l'application lit cette chaîne, la vérifie et réhydrate le DOM automatiquement.
Interaction Matérielle (Hardware)
L'application exploite les APIs modernes du navigateur pour interagir avec le matériel du téléphone :
•	Screen Wake Lock API : Une "sentinelle" est activée dès le lancement du chronomètre pour empêcher la mise en veille automatique du système d'exploitation.
•	Vibration API : Un motif rythmique spécifique (200ms - 100ms - 200ms) est déclenché en fin de décompte pour alerter l'utilisateur sans qu'il ait besoin de regarder l'écran.
4. Architecture Logicielle
Organisation Modulaire
Le code source est scindé en fichiers distincts respectant la séparation des responsabilités :
•	Core (pwa.js) : Gère le cycle de vie de l'application, l'installation et la détection des mises à jour.
•	Logique Métier (chrono.js) : Encapsule l'algorithme de gestion du temps et le pilotage des capteurs matériels.
•	Gestion de Données (api.js) : Centralise les appels réseaux (fetch) et les opérations de lecture/écriture dans le stockage local.
•	Proxy Réseau (service_worker.js) : Script d'arrière-plan interceptant les requêtes HTTP pour servir le cache.
Modèle de Données
Les données sont structurées sous forme d'un tableau d'objets JSON standardisé :
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
5. Fonctionnement PWA et Offline
Le mode hors-ligne repose sur une stratégie de cache stricte nommée Cache-First, définie dans le Service Worker.
1.	Installation (Pre-Cache) : Lors de la première visite, l'intégralité des fichiers statiques (HTML, CSS, JS, Polices) est téléchargée et stockée dans le cache du navigateur.
2.	Interception (Fetch) : Chaque requête réseau est interceptée. Le Service Worker vérifie d'abord la présence du fichier en cache avant de solliciter le réseau.
3.	Cycle de Vie (Update) : À chaque modification du code, le numéro de version (constante VERSION) est incrémenté. Lors de l'activation, un script de nettoyage purge automatiquement les anciens caches pour garantir que l'utilisateur dispose toujours de la dernière version.
6. Perspectives d'Évolution
Pour les futures versions, plusieurs axes d'amélioration sont envisagés :
•	Mode Sombre (Dark Mode) : Implémentation d'un thème sombre natif pour réduire la consommation d'énergie.
•	Visualisation de Données : Ajout d'une page de statistiques utilisant une librairie graphique (ex: Chart.js) pour visualiser la progression des charges soulevées.
•	Partage de Séance : Génération d'un lien unique ou d'un QR Code permettant de transférer sa séance type à un partenaire d'entraînement.
•	Enregistrement de séance : créer une page pour enregistrer les séance en fonction de la date.

