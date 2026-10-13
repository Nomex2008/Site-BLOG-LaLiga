
import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";

const ARTICLES_URL = "https://wt.kpi.fei.tuke.sk/api/article";
const ARTICLES_PER_PAGE = 20;

export default [
    {
        hash: "welcome",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML =
                document.getElementById("template-welcome").innerHTML;
        }
    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML =
                document.getElementById("template-addOpinion").innerHTML;

            document.getElementById("opnFrm").onsubmit =
                processOpnFrmData;
        }
    }
];

function createHtml4opinions(targetElm) {
    let opinions = [];

    try {
        opinions = JSON.parse(
            localStorage.getItem("laLigaOpinions")
        ) || [];
    } catch (error) {
        opinions = [];
    }

    opinions = opinions.map((opinion) => ({
        ...opinion,
        createdDate: new Date(opinion.created).toLocaleString(),
        willReturnMessage: opinion.willReturn
            ? "I will return to this page."
            : "I will not return to this page."
    }));

    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-opinions").innerHTML,
            opinions
        );
}

function fetchAndDisplayArticles(targetElm, offsetParam) {
    const offset = Math.max(0, Number.parseInt(offsetParam, 10) || 0);
    const url = `${ARTICLES_URL}/?max=${ARTICLES_PER_PAGE}&offset=${offset}`;

    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.responseType = "json";

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            const responseJSON = xhr.response;

            if (!responseJSON) {
                showArticlesError(targetElm, "The server returned invalid JSON.");
                return;
            }

            const articles = Array.isArray(responseJSON.articles)
                ? responseJSON.articles
                : [];

            const totalCount = Number(
                responseJSON.meta?.totalCount
            );

            const view = {
                articles: articles,
                previousPage: offset > 0,
                previousOffset: Math.max(0, offset - ARTICLES_PER_PAGE),
                nextPage: Number.isFinite(totalCount)
                    ? offset + articles.length < totalCount
                    : articles.length === ARTICLES_PER_PAGE,
                nextOffset: offset + ARTICLES_PER_PAGE
            };

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    view
                );
        } else {
            showArticlesError(
                targetElm,
                `Server answered with ${xhr.status}: ${xhr.statusText}.`
            );
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error while loading articles.");
    };

    xhr.send();
}

function showArticlesError(targetElm, errorMessage) {
    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-articles-error").innerHTML,
            { errMessage: errorMessage }
        );
}