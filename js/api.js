/******************************************************************************/
/* Constants                                                                  */
/******************************************************************************/

const API_URL = "https://wger.de/api/v2/exercise/search/";
const BTN_SEARCH = document.getElementById("bouton-recherche");
const LIST_RESULTS = document.getElementById("liste-resultats");
const INPUT_SEARCH = document.getElementById("barre-recherche");
const SESSION_LIST = document.getElementById("liste-seance");

/******************************************************************************/
/* Fonction                                                            */
/******************************************************************************/

main();

// Fonction principale d'initialisation
function main() {
    console.debug("main() - api.js");

    if (BTN_SEARCH != null) {
        BTN_SEARCH.addEventListener("click", chercher);
    }

    chargerSeance();
}

/******************************************************************************/
/* FONCTIONS API ET DOM                                                       */
/******************************************************************************/

// Recherche d'exercices via l'API
async function chercher() {
    let mot = "";

    if (INPUT_SEARCH != null) {
        mot = INPUT_SEARCH.value.trim(); // Supprime les espaces en début et fin de chaîne

        // Validation du champ
        if (!INPUT_SEARCH.checkValidity()) { // Pas de caractère spéciaux
            LIST_RESULTS.innerHTML = '<li class="list-group-item text-danger">Veuillez vérifier votre saisie.</li>';
            return;
        }
    }

    // Vérification de contenu vide
    if (!mot) {
        LIST_RESULTS.innerHTML = '<li class="list-group-item text-warning">Veuillez saisir une recherche (ex: Curl)</li>';
        return;
    }

    LIST_RESULTS.innerHTML = '<li class="list-group-item">Chargement...</li>';

    try {
        const URL = API_URL + "?term=" + mot; 

        // Récupération des données depuis l'API
        const RESPONSE = await fetch(URL);

        if (!RESPONSE.ok) {
            throw new Error("Erreur HTTP : " + RESPONSE.status);
        }

        const DATA = await RESPONSE.json(); 

        console.log("Données reçues :", DATA);

        // Vérification des résultats
        if (!DATA.suggestions || DATA.suggestions.length == 0) {
            LIST_RESULTS.innerHTML = '<li class="list-group-item">Rien trouvé.</li>';
        } else {
            afficher(DATA.suggestions);
        }
    } catch (error) {
        console.error("Erreur API :", error);
        LIST_RESULTS.innerHTML = '<li class="list-group-item text-danger">Erreur réseau</li>';
    }
}

// Affiche les résultats dans la liste
function afficher(tableau) {
    if (LIST_RESULTS != null) {
        LIST_RESULTS.innerHTML = ""; //On vide la liste précédente
    }

    for (let ITEM of tableau) {
        const NOM = ITEM.value;

        const LI = document.createElement("li");
        LI.className = "list-group-item list-group-item-action d-flex align-items-center";
        LI.style.cursor = "pointer";

        const ICON = document.createElement("i");
        ICON.className = "bi bi-activity me-3 fs-4 text-primary";

        const TEXT = document.createElement("span");
        TEXT.textContent = NOM;

        LI.appendChild(ICON);
        LI.appendChild(TEXT);

        // Gestion du clic pour l'ajout
        LI.addEventListener("click", function () {
            ajouterExercice(NOM);
        });

        if (LIST_RESULTS != null) {
            LIST_RESULTS.appendChild(LI);
        }
    }
}

// Ajoute un exercice et sauvegarde
function ajouterExercice(nom) {
    // Initialisation de l'exercice avec valeurs par défaut
    const EXO = {
        nom: nom,
        series: "4",
        reps: "12",
        poids: "0"
    };
    ajouterExerciceSansSave(EXO);
    sauvegarderSeance();
}

// Crée un champ de saisie
function createInput(label, placeholder, valeur) {
    const DIV = document.createElement("div");
    DIV.className = "form-floating champ-saisie-seance";
    DIV.style.minWidth = "70px";

    const INPUT = document.createElement("input");
    INPUT.className = "form-control";
    INPUT.type = "text";
    INPUT.inputMode = "numeric";
    INPUT.pattern = "-?[0-9]*(\\.[0-9]+)?";
    INPUT.placeholder = placeholder;
    INPUT.value = valeur; // Affectation de la valeur sauvegardée

    // Génération d'un ID unique
    const ID = "input_" + Math.random().toString(36).substr(2, 9);
    INPUT.id = ID;

    const LBL = document.createElement("label");
    LBL.htmlFor = ID;
    LBL.textContent = label;

    // Sauvegarde auto à chaque changement
    INPUT.addEventListener("input", function () {
        sauvegarderSeance();
    });

    DIV.appendChild(INPUT);
    DIV.appendChild(LBL);
    return DIV;
}

// Ajoute un élément visuel sans sauvegarde
function ajouterExerciceSansSave(exo) {
    if (SESSION_LIST == null) {
        return;
    }

    // Nettoyage si la liste contient le message "Aucun"
    if (SESSION_LIST.children.length == 1 && SESSION_LIST.children[0].textContent.trim().startsWith("Aucun")) {
        SESSION_LIST.innerHTML = "";
    }

    const LI = document.createElement("li");
    LI.className = "list-group-item d-flex flex-wrap align-items-center gap-2 element-seance py-3";

    const ICON = document.createElement("i");
    ICON.className = "bi bi-check-circle-fill text-success fs-4 me-2";

    const TITLE = document.createElement("span");
    TITLE.className = "fw-bold me-auto contenu-seance-titre";
    TITLE.textContent = exo.nom;

    const INPUTS_CONTAINER = document.createElement("div");
    INPUTS_CONTAINER.className = "champs-saisie-seance d-flex gap-2 align-items-center";

    // Initialisation des valeurs
    const valSeries = (exo.series != null) ? exo.series : "4";
    const valReps = (exo.reps != null) ? exo.reps : "12";
    const valPoids = (exo.poids != null) ? exo.poids : "0";

    INPUTS_CONTAINER.appendChild(createInput("Séries", "4", valSeries));
    INPUTS_CONTAINER.appendChild(createInput("Reps", "12", valReps));
    INPUTS_CONTAINER.appendChild(createInput("Kg", "0", valPoids));

    const DELETE_BTN = document.createElement("button");
    DELETE_BTN.className = "btn btn-outline-danger btn-sm bouton-supprimer-seance";
    DELETE_BTN.innerHTML = '<i class="bi bi-trash"></i>';
    DELETE_BTN.title = "Supprimer";

    // Suppression de l'élément
    DELETE_BTN.addEventListener("click", function () {
        LI.remove();
        sauvegarderSeance();
    });

    INPUTS_CONTAINER.appendChild(DELETE_BTN);

    LI.appendChild(ICON);
    LI.appendChild(TITLE);
    LI.appendChild(INPUTS_CONTAINER);

    SESSION_LIST.appendChild(LI);
}

/******************************************************************************/
/* PERSISTANCE (LOCAL STORAGE)                                                */
/******************************************************************************/

// Sauvegarde la séance dans le localStorage
function sauvegarderSeance() {
    if (SESSION_LIST == null) {
        return;
    }

    const EXERCICES = [];
    const ITEMS = SESSION_LIST.querySelectorAll(".element-seance");

    for (let ITEM of ITEMS) {
        const TITRE_EL = ITEM.querySelector(".contenu-seance-titre");
        const INPUTS = ITEM.querySelectorAll("input");

        let titre = "Exercice";
        let nbSeries = "4";
        let nbReps = "12";
        let poids = "0";

        // Récupération du titre
        if (TITRE_EL != null) {
            titre = TITRE_EL.textContent; // Récupération du titre de l'exercice
        }

        // Vérification de la longueur des inputs
        if (INPUTS.length == 3) {
            nbSeries = INPUTS[0].value;
            nbReps = INPUTS[1].value;
            poids = INPUTS[2].value;
        }

        const EXO_OBJ = {
            nom: titre,
            series: nbSeries,
            reps: nbReps,
            poids: poids
        };

        // Ajout au tableau d'exercices
        EXERCICES[EXERCICES.length] = EXO_OBJ;
    }

    try {
        //tableau d'objets JS en chaines de caractères
        localStorage.setItem("maSeance", JSON.stringify(EXERCICES));
        console.log("Sauvegarde effectuée.", EXERCICES);
    } catch (erreur) {
        console.error("Erreur lors de la sauvegarde :", erreur);
    }
}

// Restaure la séance depuis le localStorage
function chargerSeance() {
    const DATA = localStorage.getItem("maSeance");

    if (DATA == null) {
        return;
    }

    try {
        const EXERCICES = JSON.parse(DATA); //chaines de caractères en tableau d'objets JS

        if (EXERCICES && EXERCICES.length > 0) {
            if (SESSION_LIST != null) {
                SESSION_LIST.innerHTML = "";
            }

            for (let EXO of EXERCICES) {
                ajouterExerciceSansSave(EXO);
            }
        }
    } catch (erreur) {
        console.error("Erreur lecture données :", erreur);
    }
}
