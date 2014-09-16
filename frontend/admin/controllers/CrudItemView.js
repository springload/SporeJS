var ConfirmModalView = require("./ConfirmModalView");

module.exports = Backbone.Marionette.ItemView.extend({
    template: "item",
    events: {
        "click .crud__delete": "handleRemove",
        "click [data-edit]": "edit"
    },
    ui: {
        "delete": ".crud__delete"
    },
    initialize: function(opts) {
        this.parentView = opts.parentView;
    },
    onRender: function() {
        this.stickit();
    },
    edit: function () {
        this.parentView.handleEdit(this.model);
    },
    bindings: {
        '.name': 'name',
        '.deleted': "deleted"
    },
    modelEvents: {
        'change': 'fieldsChanged',
        'remove': 'remove'
    },
    fieldsChanged: function() {
        this.render();
    },
    handleRemove: function(e) {
        var modal = new ConfirmModalView({
            model: new Backbone.Model({message: "Delete this item forever?"})
        });

        this.parentView.$el.append(modal.render().$el.show());

        this.listenTo(modal, "confirm", function(e) {
            this.model.destroy();
            this.remove();
        });
    }
});