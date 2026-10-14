
import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import ArticleFormsHandler from "./articleFormsHandler.js";

const API_BASE_URL = "https://raw.githubusercontent.com/Nomex2008/json-for-Blog/refs/heads/main/articles.json";
const ARTICLES_PER_PAGE = 20;

const articleFormsHandler = new ArticleFormsHandler(API_BASE_URL);

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
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },
    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: insertArticle
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

function showArticlesError(targetElm, message) {
    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-articles-error").innerHTML,
            { errMessage: message }
        );
}

function parseResponse(xhr) {
    return xhr.responseText ? JSON.parse(xhr.responseText) : {};
}

function getArticle(data) {
    return data.article || data.data || data;
}

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

// Display the paginated list of articles.
function fetchAndDisplayArticles(targetElm) {
    const hashParts = window.location.hash.split("/");
    const offset = Math.max(0, Number(hashParts[1]) || 0);

    const xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        `${API_BASE_URL}`,
        //`${API_BASE_URL}/article?offset=${offset}&max=${ARTICLES_PER_PAGE}`,
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = parseResponse(xhr);
                const allArticles = data.articles || data.items || [];

                const totalCount =
                    data.meta?.totalCount ??
                    data.totalCount ??
                    allArticles.length;

                const viewData = {
                    articles: allArticles.map((article) => ({
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
                        offset + allArticles.length < totalCount,
                    nextOffset: offset + ARTICLES_PER_PAGE
                };

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles").innerHTML,
                        viewData
                    );
            } catch (error) {
                showArticlesError(targetElm, error.message);
            }
        } else {
            showArticlesError(targetElm, `HTTP ${xhr.status}`);
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error");
    };

    xhr.send();
}

// Display one article.
function fetchAndDisplayArticleDetail(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        `${API_BASE_URL}/article/${encodeURIComponent(artIdFromHash)}`,
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const article = getArticle(parseResponse(xhr));

                if (!article || article.id === undefined) {
                    showArticlesError(targetElm, "Article not found");
                    return;
                }

                const offset = Number(offsetFromHash) || 0;
                const totalCount = Number(totalCountFromHash) || 0;

                const viewData = {
                    ...article,
                    tags: Array.isArray(article.tags)
                        ? article.tags.join(", ")
                        : article.tags,
                    backLink: `#articles/${offset}`,
                    editLink:
                        `#artEdit/${article.id}/${offset}/${totalCount}`,
                    deleteLink:
                        `#artDelete/${article.id}/${offset}/${totalCount}`
                };

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        viewData
                    );
            } catch (error) {
                showArticlesError(targetElm, error.message);
            }
        } else {
            showArticlesError(targetElm, `HTTP ${xhr.status}`);
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error");
    };

    xhr.send();
}

function editArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const xhr = new XMLHttpRequest();

    xhr.open(
        "GET",
        `${API_BASE_URL}/articles`,
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const article = getArticle(parseResponse(xhr));

                if (!article || article.id === undefined) {
                    showArticlesError(targetElm, "Article not found");
                    return;
                }

                renderArticleForm(
                    targetElm,
                    article,
                    article.id,
                    offsetFromHash,
                    totalCountFromHash,
                    true
                );
            } catch (error) {
                showArticlesError(targetElm, error.message);
            }
        } else {
            showArticlesError(targetElm, `HTTP ${xhr.status}`);
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error");
    };

    xhr.send();
}

function insertArticle(targetElm) {
    renderArticleForm(
        targetElm,
        {
            title: "",
            author: "",
            imageLink: "",
            content: "",
            tags: ""
        },
        -1,
        0,
        0,
        false
    );
}

function renderArticleForm(
    targetElm,
    article,
    articleId,
    offset,
    totalCount,
    forEdit
) {
    const viewData = {
        ...article,
        tags: Array.isArray(article.tags)
            ? article.tags.join(", ")
            : article.tags,
        formTitle: forEdit ? "Edit article" : "Add article",
        submitBtTitle: forEdit ? "Save article" : "Add article",
        backLink: forEdit
            ? `#article/${articleId}/${offset}/${totalCount}`
            : "#articles"
    };

    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-article-form").innerHTML,
            viewData
        );

    articleFormsHandler.assignFormAndArticle(
        "articleForm",
        "hiddenElm",
        forEdit ? articleId : -1,
        Number(offset) || 0,
        Number(totalCount) || 0
    );
}

// Delete an article.
function deleteArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const offset = Number(offsetFromHash) || 0;
    const totalCount = Number(totalCountFromHash) || 0;

    if (!window.confirm("Are you sure you want to delete this article?")) {
        window.location.hash =
            `#article/${artIdFromHash}/${offset}/${totalCount}`;
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.open(
        "DELETE",
        `${API_BASE_URL}/article/${encodeURIComponent(artIdFromHash)}`,
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            window.alert("Article deleted successfully.");
            window.location.hash = `#articles/${offset}`;
        } else {
            showArticlesError(
                targetElm,
                `Could not delete article. HTTP ${xhr.status}`
            );
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error");
    };

    xhr.send();
}