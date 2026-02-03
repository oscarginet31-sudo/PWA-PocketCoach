/******************************************************************************/
/* Constants                                                                  */
/******************************************************************************/

const VERSION = "4.1";

// Liste des ressources à mettre en cache
const RESSOURCES = [
    "./index.html",
    "./css/style.css",
    "./js/pwa.js",
    "./js/chrono.js",
    "./js/api.js",
    "./favicon/site.webmanifest",
    "./css/bootstrap.min.css",
    "./css/bootstrap-icons.min.css",
    "./js/bootstrap.bundle.min.js",
    "./css/fonts/bootstrap-icons.woff",
    "./css/fonts/bootstrap-icons.woff2",
    "./favicon/apple-touch-icon.png",
    "./favicon/favicon.ico",
    "./favicon/favicon.svg",
    "./favicon/favicon-96x96.png",
    "./favicon/web-app-manifest-192x192.png",
    "./favicon/web-app-manifest-512x512.png"
];

/******************************************************************************/
/* Listeners                                                                  */
/******************************************************************************/

self.addEventListener("install", onInstall);

self.addEventListener("fetch", onFetch);

/******************************************************************************/
/* Install                                                                    */
/******************************************************************************/

// Phase d'installation
function onInstall(event) {
    console.debug("onInstall()");
    self.skipWaiting();
    event.waitUntil(caching());
}

// Met en cache les ressources de l'application
async function caching() {
    console.debug("caching()");

    const KEYS = await caches.keys();

    // Vérification de la version actuelle
    if (!KEYS.includes(VERSION)) {
        console.log("Caching version:", VERSION);
        const CACHE = await caches.open(VERSION);

        // Mise en cache des fichiers
        await CACHE.addAll(RESSOURCES);

        for (const KEY of KEYS) {
            // Filtre les versions obsolètes
            if (KEY != VERSION) {
                console.log("Suppress old cache version:", KEY);
                await caches.delete(KEY);
            }
        }
    }
}

/******************************************************************************/
/* FETCH                                                                      */
/******************************************************************************/

// Intercepte les requêtes réseau
function onFetch(event) {
    console.debug("onFetch()");
    event.respondWith(getResponse(event.request));
}

// Stratégie Cache First
async function getResponse(request) {
    console.debug("getResponse()");
    const RESPONSE = await caches.match(request);

    if (RESPONSE) {
        console.log("Fetch from cache " + request.url);
        return RESPONSE;
    } else {
        console.log("Fetch from server " + request.url);
        return fetch(request);
    }
}