var ConfirmModalView = require("./ConfirmModalView");

module.exports = Backbone.Marionette.ItemView.extend({
    className: "modal",
    onRender: function() {
        var $content = this.$el.find(".modal__content");
        $content.css({top: this.originalScrollPos + "px"});
        this.$content = $content;
        this.stickit();
    },
    sandbox: function(e) {
        e.stopPropagation();
    },
    initialize: function(opts) {
        this.originalScrollPos = window.scrollY;
        this.parentView = opts.parentView;
        console.log(this.model);
    },
    doRemove: function() {
        this.$content.removeClass("anim-entrance");
        this.$content.addClass("anim-exit");
        var repaint = document.documentElement.offsetLeft;
        this.$content.addClass("anim-entrance");

        var events = [
            "webkitAnimationEnd",
            "animationend",
            "msAnimationEnd",
            "mozAnimationEnd"
        ].join(" ");

        this.$content.on(events, this.remove.bind(this));
    },
    onBeforeClose: function() {
        this.unstickit();
    }
});
