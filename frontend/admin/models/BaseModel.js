var BaseModel = Backbone.Model.extend({
    baseUrl: "",
    initialize: function () {
        if (this.isNew()) {
            this.set('created_at', Date.now());
        }

        _.bindAll(this, 'handleSave', 'handleError');
        this.on("error", this.handleError);
    },

    handleSave: function(model, response, options){
        // model.set(response.data);
    },

    handleError: function(model, response, options){
        var err = response.responseJSON.error;

        if (err.data) {
            alert(err.data)
        } else {
            alert(err);
        }

    },

    parse: function(response, options){
        if (options.collection) return response;

        if (response.status === "success") {
            console.log("parsing res:data");
            return response.data ? response.data : {};
        } else {
            console.log("ERROR!!", response, options, this);
            this.trigger("error", response);

            return false;
        }
    }
});


module.exports = BaseModel;