
export default class ArticleFormsHandler {
    constructor(articlesServerUrl) {
        this.serverUrl = articlesServerUrl;
    }

    assignFormAndArticle(
        formElementId,
        cssClass2hideElement,
        articleId,
        offset,
        totalCount
    ) {
        this.cssCl2hideElm = cssClass2hideElement;

        const artForm = document.getElementById(formElementId);

        if (!artForm) {
            console.error(`Form with id "${formElementId}" was not found.`);
            return;
        }

        this.formElements = artForm.elements;

        // Upload controls are optional: the current HTML form
        // does not contain these elements.
        const showUploadButton =
            this.formElements.namedItem("btShowFileUpload");

        const uploadButton =
            this.formElements.namedItem("btFileUpload");

        const cancelUploadButton =
            this.formElements.namedItem("btCancelFileUpload");

        if (showUploadButton) {
            showUploadButton.onclick = () => this.showFileUpload();
        }

        if (uploadButton) {
            uploadButton.onclick = () => this.uploadImg();
        }

        if (cancelUploadButton) {
            cancelUploadButton.onclick = () => this.cancelFileUpload();
        }

        if (Number(articleId) >= 0) {
            // Edit an existing article.
            this.articleId = articleId;
            this.offset = offset;
            this.totalCount = totalCount;

            artForm.onsubmit = (event) =>
                this.processArtEditFrmData(event);
        } else {
            // Insert a new article.
            artForm.onsubmit = (event) =>
                this.processArtInsertFrmData(event);
        }
    }

    showFileUpload() {
        const fieldset =
            this.formElements.namedItem("fsetFileUpload");
        const button =
            this.formElements.namedItem("btShowFileUpload");

        if (fieldset) {
            fieldset.classList.remove(this.cssCl2hideElm);
        }

        if (button) {
            button.classList.add(this.cssCl2hideElm);
        }
    }

    cancelFileUpload() {
        const fieldset =
            this.formElements.namedItem("fsetFileUpload");
        const button =
            this.formElements.namedItem("btShowFileUpload");

        if (fieldset) {
            fieldset.classList.add(this.cssCl2hideElm);
        }

        if (button) {
            button.classList.remove(this.cssCl2hideElm);
        }
    }

    uploadImg() {
        const fileInput = this.formElements.namedItem("flElm");

        if (!fileInput || !fileInput.files.length) {
            window.alert("Please, choose an image file.");
            return;
        }

        if (!this.serverUrl) {
            window.alert(
                "Image upload requires a configured API server."
            );
            return;
        }

        const imgLinkElement =
            this.formElements.namedItem("imageLink");

        const fieldsetElement =
            this.formElements.namedItem("fsetFileUpload");

        const showButton =
            this.formElements.namedItem("btShowFileUpload");

        const imgData = new FormData();
        imgData.append("file", fileInput.files[0]);

        fetch(`${this.serverUrl}/fileUpload`, {
            method: "POST",
            body: imgData
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Server answered with ${response.status}`
                    );
                }

                return response.json();
            })
            .then((responseJSON) => {
                imgLinkElement.value = responseJSON.fullFileUrl;

                if (showButton) {
                    showButton.classList.remove(this.cssCl2hideElm);
                }

                if (fieldsetElement) {
                    fieldsetElement.classList.add(this.cssCl2hideElm);
                }
            })
            .catch((error) => {
                window.alert(`Image uploading failed: ${error.message}`);
            });
    }

    
getArticleData() {
    const title = this.formElements.namedItem("title").value.trim();
    const author =
        this.formElements.namedItem("author").value.trim() || "anonymous";
    const imageLink =
        this.formElements.namedItem("imageLink").value.trim();
    const content =
        this.formElements.namedItem("content").value.trim();

    const tagsInput = this.formElements.namedItem("tags").value;

    const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

    const blogTag = "laLigaBlog2026";

    if (!tags.includes(blogTag)) {
        tags.push(blogTag);
    }

    return {
        title,
        author,
        imageLink,
        content,
        tags
    };
}

    processArtEditFrmData(event) {
        event.preventDefault();

        const articleData = this.getArticleData();

        if (!articleData) {
            return;
        }

        if (!this.serverUrl) {
            window.alert(
                "The form works, but saving requires an API server. " +
                "Your changes have not been saved."
            );
            return;
        }

        fetch(
            `${this.serverUrl}/article/${encodeURIComponent(this.articleId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(articleData)
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Server answered with ${response.status}: ${response.statusText}`
                    );
                }

                window.alert("Article updated successfully.");
                window.location.hash =
                    `#article/${this.articleId}/${this.offset}/${this.totalCount}`;
            })
            .catch((error) => {
                window.alert(`Failed to update article: ${error.message}`);
            });
    }

    processArtInsertFrmData(event) {
        event.preventDefault();

        const articleData = this.getArticleData();

        if (!articleData) {
            return;
        }

        if (!this.serverUrl) {
            window.alert(
                "The form works, but adding articles requires an API server. " +
                "Your article has not been saved."
            );
            return;
        }

        fetch(`${this.serverUrl}/article`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(articleData)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Server answered with ${response.status}: ${response.statusText}`
                    );
                }

                return response.json();
            })
            .then(() => {
                window.alert("Article added successfully.");
                window.location.hash = "#articles";
            })
            .catch((error) => {
                window.alert(`Failed to add article: ${error.message}`);
            });
    }
}