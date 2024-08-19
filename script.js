    document.addEventListener("DOMContentLoaded", function () {
    renderCriteria();
    document.getElementById("generate-pdf").addEventListener("click", generatePDF);
    document.getElementById("toggle-mode").addEventListener("click", toggleMode);

    function renderCriteria() {
        const container = document.getElementById("criteria-container");
        Object.entries(criteriaData).forEach(([key, criteria]) => {
            const section = document.createElement("section");
            section.classList.add("mb-8");
            const header = document.createElement("h2");
            header.classList.add("text-2xl", "font-bold", "text-teal-400");
            header.textContent = key;
            section.appendChild(header);

            criteria.forEach((item, idx) => {
                const div = document.createElement("div");
                div.classList.add("mb-6");
                const label = document.createElement("label");
                label.classList.add("block", "text-lg", "font-semibold", "text-teal-400");
                label.textContent = `${item.Name}`;

                const noteLabel = document.createElement("label");
                noteLabel.classList.add("block", "text-lg", "font-semibold", "text-teal-400");
                noteLabel.textContent = "Note (0-5):";

                const noteInput = document.createElement("input");
                noteInput.type = "number";
                noteInput.min = "0";
                noteInput.max = "5";
                noteInput.step = "0.1";
                noteInput.classList.add("input-field", "bg-white");
                noteInput.id = `note-${key}-${idx}`;
                noteInput.value = 0;

                const coeffLabel = document.createElement("label");
                coeffLabel.classList.add("block", "text-lg", "font-semibold", "text-teal-400");
                coeffLabel.textContent = "Coefficient (0-1):";

                const coeffInput = document.createElement("input");
                coeffInput.type = "number";
                coeffInput.min = "0";
                coeffInput.max = "1";
                coeffInput.step = "0.01";
                coeffInput.classList.add("input-field", "bg-white");
                coeffInput.id = `coefficient-${key}-${idx}`;
                coeffInput.value = item.Coefficient;

                const radioContainer = document.createElement("div");
                radioContainer.classList.add("radio-container");
                item.Options.forEach((option, optIdx) => {
                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = `${key}-${idx}`;
                    input.value = option;
                    input.id = `${key}-${idx}-${optIdx}`;

                    const span = document.createElement("span");
                    span.textContent = option;
                    span.classList.add("ml-2");

                    const labelOption = document.createElement("label");
                    labelOption.classList.add("flex", "items-center", "mb-2");
                    labelOption.appendChild(input);
                    labelOption.appendChild(span);

                    radioContainer.appendChild(labelOption);
                });

                div.appendChild(label);
                div.appendChild(radioContainer);
                div.appendChild(noteLabel);
                div.appendChild(noteInput);
                div.appendChild(coeffLabel);
                div.appendChild(coeffInput);
                section.appendChild(div);
            });

            container.appendChild(section);
        });
    }

        function generatePDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const zone = document.getElementById("zone").value;
            const observation = document.getElementById("observation").value;

            doc.setFontSize(16);
            doc.text("Audit 6S", 10, 10);
            doc.setFontSize(12);
            doc.text(`Zone/Site: ${zone}`, 10, 20);
            doc.text(`Observation: ${observation}`, 10, 30);

            let totalScore = 0;
            let criterionCount = 0;

            Object.entries(criteriaData).forEach(([key, items]) => {
                let bodyData = [];
                let sectionScore = 0;
                let sectionMaxScore = 0;

                items.forEach((item, idx) => {
                    const note = parseFloat(document.getElementById(`note-${key}-${idx}`).value) || 0;
                    const coefficient = parseFloat(document.getElementById(`coefficient-${key}-${idx}`).value) || 0;
                    const score = note * coefficient;

                    sectionScore += score;
                    sectionMaxScore += 5 * coefficient;

                    const selectedOption = (document.querySelector(`input[name="${key}-${idx}"]:checked`) || {}).value || "Non sélectionné";

                    bodyData.push([
                        item.Name,
                        selectedOption,
                        score.toFixed(2),
                    ]);
                });

                const percentageScore = ((sectionScore / sectionMaxScore) * 100).toFixed(2);
                totalScore += sectionScore;
                criterionCount++;

                doc.autoTable({
                    startY: doc.lastAutoTable?.finalY + 10 || 40,
                    head: [[key, 'Réponse', 'Score']],
                    body: bodyData,
                    theme: 'grid',
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [22, 160, 133] },
                    foot: [['Score de section', '', `${sectionScore.toFixed(2)} (${percentageScore}%)`]],
                    footStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
                });
            });

            // Correct global score calculation: (SUM(criteria_scores) / number of criteria) * 100
            const globalScore = ((totalScore / criterionCount) * 100).toFixed(2);
            doc.setFontSize(14);
            doc.text(`Score global: ${globalScore}%`, 10, doc.lastAutoTable.finalY + 20);

            doc.save("audit-6s-report.pdf");
        }


    function toggleMode() {
        const body = document.body;
        body.classList.toggle("bg-white");
        body.classList.toggle("text-gray-900");
        body.classList.toggle("bg-gray-900");
        body.classList.toggle("text-white");

        const button = document.getElementById("toggle-mode");
        if (body.classList.contains("bg-white")) {
            button.textContent = "Switch to Dark Mode";
            document.querySelectorAll("input, textarea").forEach(el => el.classList.add("bg-white"));
            document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("bg-transparent"));
        } else {
            button.textContent = "Switch to Light Mode";
            document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("bg-white"));
            document.querySelectorAll("input, textarea").forEach(el => el.classList.add("bg-transparent"));
        }
    }
});

const criteriaData = {
    Sort: [
        {
            Name: "Les éléments inutiles existent dans la zone ?",
            Options: [
                "Plus de 5 éléments inutiles",
                "4 éléments inutiles",
                "3 éléments inutiles",
                "1 à 2 éléments inutiles",
                "0 éléments inutiles",
            ],
            Coefficient: 0.02,
        },
    ],
    "Set in Order": [
        {
            Name: "Tous les articles ont un emplacement spécifique (tracage)",
            Options: [
                "Aucun article",
                "Quelques articles",
                "Tous les articles",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Les armoires, les surfaces de travail et les zones de stockage sont clairement étiquetés et bien organisés",
            Options: [
                "Aucun article",
                "Quelques articles",
                "Tous les articles",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Y a-t-il un écart entre l'état de référence et l'état réel",
            Options: ["Plusieurs écarts", "Quelques écarts", "Aucun écart"],
            Coefficient: 0.05,
        },
    ],
    Shine: [
        {
            Name: "Hygiène surfaces / Propreté",
            Options: [
                "Plus de 3 indices ou état critique d'un seul indice",
                "2 indices",
                "Un seul indice",
                "Aucun indice",
            ],
            Coefficient: 0.07,
        },
        {
            Name: "Hygiène personnel",
            Options: [
                "Plus de 3 personnes ou état critique d'une seule personne",
                "2 personnes",
                "Une seule personne",
                "RAS",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Contrôle fuite",
            Options: [
                "Présence de fuite quantité renversée importante",
                "Présence de fuite mais pas une grande quantité renversée",
                "RAS",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Gestion des déchets",
            Options: [
                "Absence de poubelles",
                "Présence poubelles Déchet sur sol",
                "Présence poubelles Déchet non trié",
                "Présence poubelles Sans signalisation",
                "RAS",
            ],
            Coefficient: 0.07,
        },
        {
            Name: "Existence de produits chimiques dans les camions reçus",
            Options: [
                "Produits partout dans le camion",
                "Quelques produits dans le camion",
                "Aucun produit",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Gestion réglementaire",
            Options: [
                "Les échappements non mesurés",
                "Les mesures des échappements ne sont pas analysées",
                "Les mesures des échappements analysées sans plan d'action",
                "Un plan d'action sur les mesures des échappements n'est pas suivi",
                "Les échappements sont contrôlés",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Consommation",
            Options: [
                "Pas de suivi",
                "Mesurée et plan d'action en place",
                "La consommation est contrôlée",
            ],
            Coefficient: 0.05,
        },
    ],
    Standardize: [
        {
            Name: "Les procédures nécessaires sont disponibles",
            Options: [
                "Aucune procédure n'est disponible",
                "Quelques procédures sont disponibles",
                "Procédures disponibles mais non validées",
                "Toutes les procédures sont disponibles et validées",
            ],
            Coefficient: 0.01,
        },
        {
            Name: "L'application et l'amélioration des procédures",
            Options: [
                "Les procédures ne sont pas appliquées",
                "Quelques procédures sont appliquées",
                "Les procédures sont appliquées mais pas d'une manière efficace",
                "Les procédures sont appliquées mais sans mise à jour et amélioration",
                "Les procédures sont appliquées avec mise à jour et amélioration",
            ],
            Coefficient: 0.02,
        },
        {
            Name: "Les modèles standards sont disponibles",
            Options: [
                "Les standards 6S n'existent pas",
                "Quelques standards",
                "Les standards existent mais ne sont pas actualisés",
                "Les standards existent mais ne sont pas affichés",
                "Standards actualisés et affichés",
            ],
            Coefficient: 0.015,
        },
        {
            Name: "Les limites réglementaires environnementales sont communiquées au personnel",
            Options: [
                "Les limites ne sont pas maîtrisées par le responsable",
                "Les limites maîtrisées mais non communiquées",
                "Les limites sont bien communiquées",
            ],
            Coefficient: 0.015,
        },
    ],
    Sustain: [
        {
            Name: "Le maintien des plans est élaboré pour assurer la responsabilisation",
            Options: [
                "Personne n'est impliqué",
                "Quelques personnes faiblement impliquées",
                "Tous les personnels sont faiblement impliqués",
                "Quelques personnes sont fortement impliquées",
                "Tout le personnel est fortement impliqué",
            ],
            Coefficient: 0.015,
        },
        {
            Name: "Personnel formé sur les 6S",
            Options: [
                "0 Personne Formée",
                "Quelques personnes formées",
                "100% formée",
            ],
            Coefficient: 0.015,
        },
        {
            Name: "Les audits 6S se produisent régulièrement",
            Options: [
                "Aucun audit n'est fait",
                "Les audits se produisent occasionnellement",
                "Les audits se produisent régulièrement",
            ],
            Coefficient: 0.02,
        },
    ],
    Safety: [
        {
            Name: "Travail en hauteur",
            Options: [
                "Absence de tous ces indices",
                "Présence de quelques indices",
                "Présence de tous les indices mais non conformes",
                "Présence de tous les indices mais sans conformité totale",
                "Présence de tous les indices avec conformité totale",
            ],
            Coefficient: 0.15,
        },
        {
            Name: "Protection Personnel",
            Options: [
                "Plus de 3 indices / fuite des gaz nocifs",
                "2 indices / Absence rétention",
                "Un seul indice",
                "Aucun indice",
            ],
            Coefficient: 0.1,
        },
        {
            Name: "Sécurité électrique",
            Options: [
                "Plus de 3 indices",
                "2 indices",
                "Un seul indice",
                "Aucun indice",
            ],
            Coefficient: 0.05,
        },
        {
            Name: "Produits Chimiques",
            Options: [
                "Plus de 3 indices / fuite des gaz nocifs",
                "2 indices / Absence rétention",
                "Un seul indice",
                "Aucun indice",
            ],
            Coefficient: 0.03,
        },
        {
            Name: "Sécurité incendie",
            Options: [
                "Plus de 3 indices",
                "3 indices",
                "Un seul indice",
                "Aucun indice",
            ],
            Coefficient: 0.05,
        },
    ],
};
