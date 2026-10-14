import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";

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
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
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
function fetchAndDisplayArticles(targetElm) {
    const hashParts = window.location.hash.split("/");
    const offset = Math.max(0, Number(hashParts[1]) || 0);

    const xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        "https://raw.githubusercontent.com/Nomex2008/json-for-Blog/refs/heads/main/articles.json",
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                const allArticles = data.articles;
                const totalCount = allArticles.length;

                const articles = allArticles.slice(
                    offset,
                    offset + ARTICLES_PER_PAGE
                );

                const viewData = {
                    articles: articles.map(article => ({
                        ...article,
                        detailLink:
                            `#article/${article.id}/${offset}/${totalCount}`
                    })),
                    previousPage: offset > 0,
                    previousOffset: Math.max(
                        0,
                        offset - ARTICLES_PER_PAGE
                    ),
                    nextPage:
                        offset + ARTICLES_PER_PAGE < totalCount,
                    nextOffset: offset + ARTICLES_PER_PAGE
                };

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById(
                            "template-articles"
                        ).innerHTML,
                        viewData
                    );
            } catch (error) {
                showArticlesError(targetElm, error.message);
            }
        } else {
            showArticlesError(targetElm, "HTTP " + xhr.status);
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error");
    };

    xhr.send();
}

function showArticlesError(targetElm, message) {
    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-articles-error").innerHTML,
            { errMessage: message }
        );
}

function fetchAndDisplayArticleDetail(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        "https://raw.githubusercontent.com/Nomex2008/json-for-Blog/refs/heads/main/articles.json",
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);

                const article = data.articles.find(
                    item => String(item.id) === String(artIdFromHash)
                );

                if (!article) {
                    showArticlesError(targetElm, "Article not found");
                    return;
                }

                const viewData = {
                    ...article,
                    backLink:
                        `#articles/${Number(offsetFromHash) || 0}`,
                    editLink:
                        `#artEdit/${article.id}/${offsetFromHash}/${totalCountFromHash}`,
                    deleteLink:
                        `#artDelete/${article.id}/${offsetFromHash}/${totalCountFromHash}`
                };

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById(
                            "template-article"
                        ).innerHTML,
                        viewData
                    );
            } catch (error) {
                showArticlesError(targetElm, error.message);
            }
        } else {
            showArticlesError(targetElm, "HTTP " + xhr.status);
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error");
    };

    xhr.send();
}