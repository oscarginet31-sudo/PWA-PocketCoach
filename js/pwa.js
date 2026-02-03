/******************************************************************************/
/* Constants                                                                  */
/******************************************************************************/

const INSTALL_BUTTON = document.getElementById("bouton-installation");
const RELOAD_BUTTON = document.getElementById("bouton-mise-a-jour");
const VERSION_APP = document.getElementById("version-app");
const PREV_VERSION = "4.1";

/******************************************************************************/
/* Global Variable                                                            */
/******************************************************************************/

let beforeInstallPromptEvent;

/******************************************************************************/
/* LISTENERS                                                                  */
/******************************************************************************/

INSTALL_BUTTON.addEventListener("click", installPwa);
RELOAD_BUTTON.addEventListener("click", reloadPwa);

/******************************************************************************/
/* Main                                                                       */
/******************************************************************************/

main();

// Fonction principale
function main() {
    console.debug("main()");

    if (VERSION_APP != null) {
        VERSION_APP.textContent = "Version : " + PREV_VERSION; // Affichage de la version
    }



    // Détection du mode Standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
        console.log("Running as PWA");

        if (INSTALL_BUTTON != null) {
            INSTALL_BUTTON.style.display = "none";
        }

        registerServiceWorker();
    } else {
        console.log("Running as Web page");

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);
    }
}

/******************************************************************************/
/* FONCTIONS D'INSTALLATION                                                   */
/******************************************************************************/

// Capture l'événement d'installation
function onBeforeInstallPrompt(event) {
    console.debug("onBeforeInstallPrompt()");

    event.preventDefault();
    if (INSTALL_BUTTON != null) {
        INSTALL_BUTTON.disabled = false;
        beforeInstallPromptEvent = event;
    }
}

// Lance l'installation
async function installPwa() {
    console.debug("installPwa()");

    if (beforeInstallPromptEvent == null) {
        return;
    }

    const RESULT = await beforeInstallPromptEvent.prompt();

    if (RESULT.outcome == "accepted") {
        console.log("Installation acceptée.");
    } else {
        console.log("Installation refusée.");
    }

    if (INSTALL_BUTTON != null) {
        INSTALL_BUTTON.style.display = "none";
    }

    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
}

// Callback après installation
function onAppInstalled() {
    console.debug("onAppInstalled()");
    registerServiceWorker();
}

/******************************************************************************/
/* GESTION SERVICE WORKER                                                     */
/******************************************************************************/

// Enregistre le Service Worker
async function registerServiceWorker() {
    console.debug("registerServiceWorker()");

    if ('serviceWorker' in navigator) {
        try {
            const REGISTRATION = await navigator.serviceWorker.register("./service_worker.js");

            // Force la vérification de mise à jour
            REGISTRATION.update();

            REGISTRATION.onupdatefound = onUpdateFound;

            console.log("Service Worker enregistré.", REGISTRATION.scope);
        } catch (error) {
            console.error("Erreur enregistrement SW :", error);
        }
    } else {
        console.warn("Service Worker non supporté.");
    }
}

// Détection de mise à jour
function onUpdateFound(event) {
    console.debug("onUpdateFound()");
    const REGISTRATION = event.target;
    const SERVICE_WORKER = REGISTRATION.installing;

    if (SERVICE_WORKER != null) {
        SERVICE_WORKER.addEventListener("statechange", onStateChange);
    }
}

// Surveille l'état du Service Worker
function onStateChange(event) {
    const SERVICE_WORKER = event.target;
    console.debug("État SW :", SERVICE_WORKER.state);

    if (SERVICE_WORKER.state == "installed" && navigator.serviceWorker.controller) {
        console.log("Mise à jour disponible.");

        if (RELOAD_BUTTON != null) {
            RELOAD_BUTTON.style.display = "inline-block";
            RELOAD_BUTTON.disabled = false;
        }
    }
}

// Recharge l'application
function reloadPwa() {
    console.debug("reloadPwa()");
    window.location.reload();
}