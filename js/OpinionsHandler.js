export default class OpinionsHandler {
    constructor(opinionsFormId, opinionsContainerId) {
        this.opinionsFormElm = document.getElementById(opinionsFormId);
        this.opinionsContainerElm = document.getElementById(opinionsContainerId);
        this.opinions = [];
    }

    opinion2html(opinion) {
        return `
            <article class="visitor-opinion">
                <h3>${opinion.name}</h3>
                <p><strong>Email:</strong> ${opinion.email}</p>
                <p><strong>Favorite team:</strong> ${opinion.favoriteTeam}</p>
                <p><strong>Opinion:</strong> ${opinion.opinion}</p>
                <p><strong>Keywords:</strong> ${opinion.keywords}</p>
                <p>${opinion.willReturn ? "I will return to this page." : "I will not return to this page."}</p>
                <p><small>${new Date(opinion.created).toLocaleString()}</small></p>
                ${opinion.image ? `<img src="${opinion.image}" alt="Image shared by ${opinion.name}">` : ""}
            </article>
        `;
    }

    opinionArray2html(sourceData) {
        return sourceData.map(opinion => this.opinion2html(opinion)).join("");
    }

    init() {
        try {
            this.opinions = JSON.parse(localStorage.getItem("laLigaOpinions")) || [];
        } catch (error) {
            this.opinions = [];
        }

        this.opinionsContainerElm.innerHTML = this.opinionArray2html(this.opinions);

        this.opinionsFormElm.addEventListener(
            "submit",
            this.processOpnFrmData.bind(this)
        );
    }

    processOpnFrmData(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const image = document.getElementById("image").value.trim();
        const selectedTeam = document.querySelector(
            'input[name="favorite-team"]:checked'
        );
        const willReturn = document.getElementById("will-return").checked;
        const keywords = document.getElementById("keywords").value.trim();
        const opinion = document.getElementById("opinion").value.trim();

        const newOpinion = {
            name: name,
            email: email,
            image: image,
            favoriteTeam: selectedTeam ? selectedTeam.value : "",
            willReturn: willReturn,
            keywords: keywords,
            opinion: opinion,
            created: new Date()
        };

        this.opinions.push(newOpinion);

        localStorage.setItem("laLigaOpinions", JSON.stringify(this.opinions));

        this.opinionsContainerElm.insertAdjacentHTML(
            "beforeend",
            this.opinion2html(newOpinion)
        );

        this.opinionsFormElm.reset();
    }
}