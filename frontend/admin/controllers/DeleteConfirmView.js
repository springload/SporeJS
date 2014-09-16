var ConfirmModalView = require("./ConfirmModalView");

module.exports = Backbone.Marionette.ItemView.extend({
    el: document.querySelector("[data-delete-item]"),
    events: {
        "click": "confirmDelete"
    },
    confirmDelete: function(e) {
        e.preventDefault();
        e.stopPropagation();

        var url = this.el.dataset.deleteProject;
        var modal = new ConfirmModalView({
            model: new Backbone.Model({
                message: "Delete this item? You can't undo this."
            })});

        this.$el.after(modal.render().$el.show());

        this.listenTo(modal, "confirm", function(){
            var form = document.querySelector("[data-form]");

            $.ajax("/" + url, {
                method: "DELETE",
                dataType: "json"
            }).done(function(response) {
                    if (response.status === "success") {
                        window.location = "/";
                    }
                });

        });
    }
});
