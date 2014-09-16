var ModalView = require("./ModalView");

module.exports = ModalView.extend({
    template: "modal",
    events: {
        "click [data-cancel]": "doRemove",
        "submit @ui.form": "save",
        "click .modal__content": "sandbox",
        "click": "doRemove"
    },
    ui: {
        "form": "form"
    },
    save: function(e) {
        var model = this.options.originalModel;

        this.listenTo(model, "sync", this.handleSave.bind(this));
        e.preventDefault();
        e.stopPropagation();

        model.save(this.model.attributes, {
            patch: true,
            wait: true
        });
    },

    handleSave: function(e) {
        console.log("handleSave", e);
        this.doRemove();
    }
});