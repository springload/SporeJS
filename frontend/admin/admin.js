/*global Backbone */

(function(Backbone) {
    'use strict';

    $.ajaxSetup( {
        beforeSend: function ( xhr ) {
            xhr.setRequestHeader( 'X-CSRF-Token', window.csrfToken );
        }
    });


    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };



    Backbone.Model.prototype.parse = function(resp, xhr) {
       // console.log(resp);
       return resp;
    };


    var ModalView = require("./controllers/ModalView");
    var ConfirmModalView = require("./controllers/ConfirmModalView");
    var DeleteConfirmView = require("./controllers/DeleteConfirmView");
    var CrudItemView = require("./controllers/CrudItemView");
    var CrudCollectionView = require("./controllers/CrudCollectionView");
    var CrudModalView = require("./controllers/CrudModalView");

    window.Editor = new Backbone.Marionette.Application();

    Backbone.Marionette.Renderer.render = function(template, data){
        return nunjucks.render(template, data);
    };


    Editor.on('start', function () {
        Backbone.history.start();

        Editor.addRegions({
            app: '[data-editor]'
        });

        var delConf = new DeleteConfirmView();

    });


    document.addEventListener("DOMContentLoaded", function() {
        var ed = document.querySelector("[data-editor]");

        if (ed) {
            Editor.projectId = ed.dataset.editor;
            Editor.start();
        }

    }, false);

})(Backbone);
