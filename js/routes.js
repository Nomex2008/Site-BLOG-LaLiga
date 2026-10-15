
import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import ArticleFormsHandler from "./articleFormsHandler.js";

const API_SERVER_URL  = "http://147.232.205.46:3000";
const API_BASE_URL = `${API_SERVER_URL}/article`;

const ARTICLES_PER_PAGE = 20;
const COMMENTS_PER_PAGE = 10;
const BLOG_TAG = "la-liga-project-2026";

const articleFormsHandler = new ArticleFormsHandler(API_SERVER_URL);

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

function parseResponse(xhr) {
    return xhr.responseText ? JSON.parse(xhr.responseText) : {};
}

function showArticlesError(targetElm, message) {
    const target = document.getElementById(targetElm);
    const template = document.getElementById("template-articles-error");

    if (target && template) {
        target.innerHTML = Mustache.render(template.innerHTML, {
            errMessage: message
        });
    } else if (target) {
        target.textContent = message;
    }
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

/* -------------------- ARTICLES LIST -------------------- */

function fetchAndDisplayArticles(
    targetElm,
    offsetFromHash
) {
    const offset = Math.max(0, Number(offsetFromHash) || 0);

    const url =
        `${API_BASE_URL}?tag=${encodeURIComponent(BLOG_TAG)}` +
        `&max=${ARTICLES_PER_PAGE}&offset=${offset}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = parseResponse(xhr);
                const articles = data.articles || [];
                const totalCount =
                    Number(data.meta?.totalCount) || 0;

                const viewData = {
                    articles: articles.map((article) => ({
                        ...article,
                        detailLink:
                            `#article/${article.id}/${offset}/${totalCount}/0`,
                        description: article.description ||
                            (article.content
                                ? article.content.substring(0, 180)
                                : "")
                    })),
                    previousPage: offset > 0,
                    previousOffset: Math.max(
                        0,
                        offset - ARTICLES_PER_PAGE
                    ),
                    nextPage: offset + articles.length < totalCount,
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
            showArticlesError(
                targetElm,
                `Could not load articles. HTTP ${xhr.status}`
            );
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error while loading articles.");
    };

    xhr.send();
}

/* -------------------- ARTICLE AND COMMENTS -------------------- */

function fetchAndDisplayArticleDetail(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash,
    commentOffsetFromHash,
    showCommentFormFromHash
) {
    const articleId = artIdFromHash;
    const listOffset = Number(offsetFromHash) || 0;
    const totalCount = Number(totalCountFromHash) || 0;
    const commentOffset = Math.max(
        0,
        Number(commentOffsetFromHash) || 0
    );
    const showCommentForm = showCommentFormFromHash === "addComment";

    const xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `${API_BASE_URL}/${encodeURIComponent(articleId)}`,
        true
    );

    xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300) {
            showArticlesError(
                targetElm,
                `Could not load article. HTTP ${xhr.status}`
            );
            return;
        }

        let article;

        try {
            article = parseResponse(xhr);
        } catch (error) {
            showArticlesError(targetElm, error.message);
            return;
        }

        fetchCommentsAndRender(
            targetElm,
            article,
            listOffset,
            totalCount,
            commentOffset,
            showCommentForm,
        );
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error while loading article.");
    };

    xhr.send();
}

function fetchCommentsAndRender(
    targetElm,
    article,
    listOffset,
    totalCount,
    commentOffset,
    showCommentForm
) {
    const commentsUrl =
        `${API_BASE_URL}/${encodeURIComponent(article.id)}/comment` +
        `?max=${COMMENTS_PER_PAGE}&offset=${commentOffset}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", commentsUrl, true);

    xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300) {
            showArticlesError(
                targetElm,
                `Could not load comments. HTTP ${xhr.status}`
            );
            return;
        }

        try {
            const data = parseResponse(xhr);
            const comments = data.comments || [];
            const commentsTotal = Number(data.meta?.totalCount) || 0;

            const visibleTags = Array.isArray(article.tags)
                ? article.tags.filter((tag) => tag !== BLOG_TAG).join(", ")
                : (article.tags || "");

            const viewData = {
                ...article,
                tags: visibleTags,
                content: article.content || article.description || "",
                backLink: `#articles/${listOffset}`,
                editLink:
                    `#artEdit/${article.id}/${listOffset}/${totalCount}`,
                deleteLink:
                    `#artDelete/${article.id}/${listOffset}/${totalCount}`,

                comments: comments.map((comment) => ({
                    ...comment,
                    dateCreated: comment.dateCreated
                        ? new Date(comment.dateCreated).toLocaleString()
                        : ""
                })),

                hasComments: comments.length > 0,
                showCommentForm,

                addCommentLink:
                    `#article/${article.id}/${listOffset}/${totalCount}/${commentOffset}/addComment`,

                firstCommentOffset: 0,
                previousCommentsPage: commentOffset > 0,
                previousCommentsOffset: Math.max(
                    0,
                    commentOffset - COMMENTS_PER_PAGE
                ),
                nextCommentsPage:
                    commentOffset + comments.length < commentsTotal,
                nextCommentsOffset: commentOffset + COMMENTS_PER_PAGE,

                previousCommentsLink:
                    `#article/${article.id}/${listOffset}/${totalCount}/${Math.max(0, commentOffset - COMMENTS_PER_PAGE)}`,
                nextCommentsLink:
                    `#article/${article.id}/${listOffset}/${totalCount}/${commentOffset + COMMENTS_PER_PAGE}`
            };

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-article").innerHTML,
                    viewData
                );

            const commentForm = document.getElementById("commentForm");

            if (commentForm) {
                commentForm.addEventListener("submit", function (event) {
                    submitComment(
                        event,
                        article.id,
                        listOffset,
                        totalCount,
                        commentOffset
                    );
                });
            }
        } catch (error) {
            showArticlesError(targetElm, error.message);
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error while loading comments.");
    };

    xhr.send();
}

function submitComment(
    event,
    articleId,
    listOffset,
    totalCount,
    commentOffset
) {
    event.preventDefault();

    const form = event.currentTarget;
    const author = form.elements.namedItem("commentAuthor").value.trim();
    const text = form.elements.namedItem("commentText").value.trim();

    if (!author || !text) {
        alert("Please enter your name and comment.");
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.open(
        "POST",
        `${API_BASE_URL}/${encodeURIComponent(articleId)}/comment`,
        true
    );
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 201 || xhr.status === 200) {
            alert("Comment added successfully.");

            // Return to the article with the comment form closed.
            window.location.hash =
                `#article/${articleId}/${listOffset}/${totalCount}/${commentOffset}`;
        } else {
            let message = `Could not add comment. HTTP ${xhr.status}`;

            try {
                const response = parseResponse(xhr);
                if (response.errors?.length) {
                    message = response.errors
                        .map((error) => error.message)
                        .join(", ");
                }
            } catch (error) {
                // Keep the HTTP error message.
            }

            alert(message);
        }
    };

    xhr.onerror = function () {
        alert("Network error while adding the comment.");
    };

    xhr.send(JSON.stringify({ author, text }));
}

/* -------------------- EDIT ARTICLE -------------------- */

function editArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `${API_BASE_URL}/${encodeURIComponent(artIdFromHash)}`,
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const article = parseResponse(xhr);

                renderArticleForm(
                    targetElm,
                    article,
                    article.id,
                    offsetFromHash,
                    totalCountFromHash || 0,
                    true
                );
            } catch (error) {
                showArticlesError(targetElm, error.message);
            }
        } else {
            showArticlesError(
                targetElm,
                `Could not load article for editing. HTTP ${xhr.status}`
            );
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error.");
    };

    xhr.send();
}

/* -------------------- INSERT ARTICLE -------------------- */

function insertArticle(targetElm) {
    renderArticleForm(
        targetElm,
        {
            title: "",
            author: "",
            imageLink: "",
            content: "",
            tags: []
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
    const tags = Array.isArray(article.tags)
        ? article.tags.filter((tag) => tag !== BLOG_TAG).join(", ")
        : String(article.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag && tag !== BLOG_TAG)
            .join(", ");

    const viewData = {
        ...article,
        tags,
        content: article.content || article.description || "",
        formTitle: forEdit ? "Edit article" : "Add article",
        submitBtTitle: forEdit ? "Save article" : "Add article",
        backLink: forEdit
            ? `#article/${articleId}/${Number(offset) || 0}/${Number(totalCount) || 0}/0`
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

/* -------------------- DELETE ARTICLE -------------------- */

function deleteArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const offset = Number(offsetFromHash) || 0;

    if (!window.confirm("Are you sure you want to delete this article?")) {
        window.location.hash =
            `#article/${artIdFromHash}/${offset}/${Number(totalCountFromHash) || 0}/0`;
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.open(
        "DELETE",
        `${API_BASE_URL}/${encodeURIComponent(artIdFromHash)}`,
        true
    );

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            alert("Article deleted successfully.");
            window.location.hash = `#articles/${offset}`;
        } else {
            showArticlesError(
                targetElm,
                `Could not delete article. HTTP ${xhr.status}`
            );
        }
    };

    xhr.onerror = function () {
        showArticlesError(targetElm, "Network error while deleting article.");
    };

    xhr.send();
}