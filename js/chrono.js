/******************************************************************************/
/* CONSTANTES GLOBALES                                                        */
/******************************************************************************/

const TEMPS_DEFAUT = 90;

/******************************************************************************/
/* VARIABLES D'ÉTAT                                                           */
/******************************************************************************/

let tempsGlobal = TEMPS_DEFAUT;
let tempsRestant = TEMPS_DEFAUT;
let timerId = null;
let wakeLock = null;

/******************************************************************************/
/* ÉLÉMENTS DOM                                                               */
/******************************************************************************/

const ECRAN_CHRONO = document.getElementById("affichage-chrono");
const BTN_START = document.getElementById("bouton-demarrer");
const BTN_RESET = document.getElementById("bouton-reinitialiser");
const INPUT_MIN = document.getElementById("entree-minutes");
const INPUT_SEC = document.getElementById("entree-secondes");

/******************************************************************************/
/* POINT D'ENTRÉE                                                             */
/******************************************************************************/

main();

// Initialisation du chronomètre
function main() {
    console.debug("main() - chrono.js");

    // Initialisation des écouteurs d'événements
        BTN_START.addEventListener("click", demarrerChrono);
        BTN_RESET.addEventListener("click", resetChrono);
        INPUT_MIN.addEventListener("change", mettreAJourTempsDepuisInputs);
        INPUT_SEC.addEventListener("change", mettreAJourTempsDepuisInputs);

    mettreAJourAffichage();
}

/******************************************************************************/
/* FONCTIONS API WEB                                                          */
/******************************************************************************/

// Active le verrouillage de l'écran
async function activerWakeLock() {
    try {
        // Demande d'un verrouillage de type 'screen' au navigateur
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Wake Lock activé.");
        }
    } catch (err) {
        // Gestion silencieuse : si l'API échoue (batterie faible), l'app continue de fonctionner
        console.warn("Erreur activation Wake Lock :", err);
    }
}

// Désactive le verrouillage de l'écran
async function desactiverWakeLock() {
    if (wakeLock != null) {
        await wakeLock.release();
        wakeLock = null;
        console.log("Wake Lock désactivé.");
    }
}

// Vibration de fin
function vibrerFin() {
    // Vérification de la compatibilité du navigateur
    if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500]); // Vibration de 500ms, pause de 200ms, vibration de 500ms
    }
}

/******************************************************************************/
/* FONCTIONS CHRONOMÈTRE                                                    */
/******************************************************************************/

// Met à jour l'affichage (MM:SS)
function mettreAJourAffichage() {
    if (ECRAN_CHRONO == null) {
        return;
    }

    const MINUTES = Math.floor(tempsRestant / 60);
    const SECONDES = tempsRestant % 60;

    let minStr = "" + MINUTES;
    let secStr = "" + SECONDES;

    // Formatage avec zéro initial si nécessaire
    if (MINUTES < 10) {
        minStr = "0" + MINUTES;
    }

    if (SECONDES < 10) {
        secStr = "0" + SECONDES;
    }

    ECRAN_CHRONO.textContent = minStr + ":" + secStr;
}

// Met à jour le temps global depuis les inputs
function mettreAJourTempsDepuisInputs() {
    // Si chrono actif, on ignore
    if (timerId != null) {
        return;
    }

    if (INPUT_MIN == null || INPUT_SEC == null) {
        return;
    }

    if (!INPUT_MIN.checkValidity() || !INPUT_SEC.checkValidity()) {
        return;
    }

    let minutes = parseInt(INPUT_MIN.value);
    let secondes = parseInt(INPUT_SEC.value);

    if (isNaN(minutes)) {
        //si champ vide, on met 0
        minutes = 0;
    }
    if (isNaN(secondes)) {
        //si champ vide, on met 0
        secondes = 0;
    }

    if (minutes < 0) { minutes = 0; }
    if (secondes < 0) { secondes = 0; }
    if (secondes > 59) { secondes = 59; }

    tempsGlobal = (minutes * 60) + secondes;
    tempsRestant = tempsGlobal;
    mettreAJourAffichage();
}

// Démarre le chronomètre
function demarrerChrono() {
    if (timerId != null) {
        return;
    }

    // Validation des inputs si présents
    if (INPUT_MIN != null && INPUT_SEC != null) {
        if (!INPUT_MIN.checkValidity() || !INPUT_SEC.checkValidity()) {
            alert("Veuillez vérifier les valeurs saisies.");
            return;
        }
    }

    // Synchronisation si besoin
    if (tempsRestant == tempsGlobal) {
        let minutes = 0;
        let secondes = 0;

        if (INPUT_MIN != null) {
            minutes = parseInt(INPUT_MIN.value);
            if (isNaN(minutes)) minutes = 0;
        }
        if (INPUT_SEC != null) {
            secondes = parseInt(INPUT_SEC.value);
            if (isNaN(secondes)) secondes = 0;
        }

        tempsGlobal = (minutes * 60) + secondes;

        if (tempsRestant == TEMPS_DEFAUT && tempsRestant != tempsGlobal) {
            tempsRestant = tempsGlobal;
        }
    }

    if (tempsRestant <= 0) {
        mettreAJourTempsDepuisInputs();
        if (tempsRestant <= 0) {
            return;
        }
    }

    activerWakeLock();

    // Désactivation des champs
    if (BTN_START != null) BTN_START.disabled = true;
    if (INPUT_MIN != null) INPUT_MIN.disabled = true;
    if (INPUT_SEC != null) INPUT_SEC.disabled = true;

    // Lancement de la boucle 
    if (tempsRestant > 0) {
        timerId = setTimeout(tick, 1000);
    }
}

// Fonction appelée chaque seconde par le chronomètre
function tick() {
    tempsRestant = tempsRestant - 1;
    mettreAJourAffichage();

    if (tempsRestant > 0) {
        // Nouvel appel pour la prochaine seconde
        timerId = setTimeout(tick, 1000);
    } else {
        // Fin du décompte
        arreterChrono();
        vibrerFin();
    }
}



// Arrête le chronomètre
function arreterChrono() {
    if (timerId != null) {
        clearTimeout(timerId); // Arrêt du timer 
        timerId = null; // Reset ID
    }

    desactiverWakeLock(); // Désactivation Wake Lock

    if (BTN_START != null) BTN_START.disabled = false;
    if (INPUT_MIN != null) INPUT_MIN.disabled = false;
    if (INPUT_SEC != null) INPUT_SEC.disabled = false;
}

// Réinitialise le chronomètre
function resetChrono() {
    arreterChrono();
    mettreAJourTempsDepuisInputs();
}