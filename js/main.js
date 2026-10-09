//console.log(1)
/*
const opinionForm = document.getElementById("opinion-form");

opinionForm.addEventListener("submit", processOpinionForm);

function processOpinionForm(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const image = document.getElementById("image").value.trim();

    const favoriteTeam = document.querySelector(
        'input[name="favorite-team"]:checked'
    );

    const willReturn = document.getElementById("will-return").checked;
    const keywords = document.getElementById("keywords").value.trim();
    const opinion = document.getElementById("opinion").value.trim();

    const newOpinion = {
        name: name,
        email: email,
        image: image,
        favoriteTeam: favoriteTeam ? favoriteTeam.value : "",
        willReturn: willReturn,
        keywords: keywords,
        opinion: opinion,
        created: new Date()
    };

    let opinions = JSON.parse(localStorage.getItem("laLigaOpinions")) || [];

    opinions.push(newOpinion);

    localStorage.setItem("laLigaOpinions", JSON.stringify(opinions));

    console.log(newOpinion);
    console.log(opinions);

    opinionForm.reset();
}*/

import OpinionsHandlerMustache from "./OpinionsHandlerMustache.js";

const opinionsHandler = new OpinionsHandlerMustache(
    "opinion-form",
    "opinions-container",
    "opinion-template"
);

opinionsHandler.init();