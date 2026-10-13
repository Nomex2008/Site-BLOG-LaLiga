
export default function processOpnFrmData(event) {
    event.preventDefault();

    const name = document.getElementById("nameElm").value.trim();
    const email = document.getElementById("email").value.trim();
    const image = document.getElementById("image").value.trim();
    const selectedTeam = document.querySelector(
        'input[name="favorite-team"]:checked'
    );
    const willReturn = document.getElementById("willReturnElm").checked;
    const keywords = document.getElementById("keywords").value.trim();
    const opinion = document.getElementById("opnElm").value.trim();

    if (!name || !email || !opinion) {
        window.alert("Please enter your name, email and opinion.");
        return;
    }

    const newOpinion = {
        name: name,
        email: email,
        image: image,
        favoriteTeam: selectedTeam ? selectedTeam.value : "",
        willReturn: willReturn,
        keywords: keywords,
        opinion: opinion,
        created: new Date().toISOString()
    };

    let opinions = [];

    try {
        opinions = JSON.parse(localStorage.getItem("laLigaOpinions")) || [];
    } catch (error) {
        opinions = [];
    }

    opinions.push(newOpinion);

    localStorage.setItem("laLigaOpinions", JSON.stringify(opinions));

    window.location.hash = "#opinions";
}