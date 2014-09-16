var ModalView = require("./ModalView");

module.exports = ModalView.extend({
    template: "confirm-modal",
    events: {
        "click [data-no]": "doRemove",
        "click [data-yes]": "rm",
        "click .modal__content": "sandbox",
        "click": "doRemove"
    },
    bindings: {
        ".message": "message"
    },
    rm: function() {
        this.trigger("confirm");
        this.doRemove();
    }
});