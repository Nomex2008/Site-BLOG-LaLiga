
import OpinionsHandler from "./OpinionsHandler.js";
import Mustache from "./mustache.js";

export default class OpinionsHandlerMustache extends OpinionsHandler {
    constructor(opinionsFormId, opinionsContainerId, templateId) {
        super(opinionsFormId, opinionsContainerId);

        this.mustacheTemplate = document.getElementById(templateId).innerHTML;
    }

    opinion2html(opinion) {
        const opinionView = {
            name: opinion.name,
            email: opinion.email,
            image: opinion.image,
            favoriteTeam: opinion.favoriteTeam,
            willReturnMessage: opinion.willReturn
                ? "I will return to this page."
                : "I will not return to this page.",
            keywords: opinion.keywords,
            opinion: opinion.opinion,
            createdDate: new Date(opinion.created).toLocaleString()
        };

        return Mustache.render(this.mustacheTemplate, opinionView);
    }
}