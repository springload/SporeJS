/**
 * Helper callback base
 * Springload - 2014
 * 
 */


module.exports = {

    /**
     * Generates default CRUD routes for a resource
     *
     * @param  {commonJS.module} moduleName -  Module
     * @param  {Array} middleware - Array of middleware to apply to the router
     * @return {express.Router} - An express router for the resource
     */
    routeCRUDFactory: function(application, controller, middleware) {
        var router = application.express.Router();

        if (middleware) {
            for (var i = 0; i < middleware.length; i++) {
                router.use(middleware[i]);
            }
        }

        if (controller.before) {
            router.use(controller.before)
        }

        router.route('/')
            .get(controller.index)
            .post(controller.create)
            .delete(controller.index);

        router.route('/new')
            .get(controller.new);

        router.route('/:id')
            .get(controller.view)
            .put(controller.update)
            .post(controller.update)
            .patch(controller.update)
            .delete(controller.remove);

        router.route('/:id/edit')
            .get(controller.edit);

        router.route('/:id/delete')
            .get(controller.delete)
            .post(controller.remove);

        router.param('id', controller.findMultiId);

        return router;
    },

    /**
     *
     * Custome error collector
     *
     * @param req
     * @param res
     * @param next
     */
    customErrorCollector: function(req, res, next) {

        req.errors = function(items) {

            if (! this.session.hasOwnProperty("validationErrors")) {
                this.session.validationErrors = {};
            }

            var errs = this.session.validationErrors;

            if (items) {
                if (items instanceof Array) {
                    for (var key in items[0]) {
                        if (items[0].hasOwnProperty(key)) {
                            this.session.validationErrors[key] = items[0][key];
                        }
                    }
                } else if (typeof items == "string") {
                	req.session.messages.push(items);
                } else {
                    for (var key in items) {
                        if (items.hasOwnProperty(key)) {
                            if (items[key].hasOwnProperty("msg")) {

                                if (!(this.session.validationErrors[key] instanceof Array)) {
                                    this.session.validationErrors[key] = [];
                                }

                                this.session.validationErrors[key].push(items[key].msg);

                            } else {

                                this.session.validationErrors[key] = items[key];
                            }
                        }
                    }
                }
            } else {
                this.session.validationErrors = {};
                return errs;
            }
        }
        next();
    },

    /**
     * Custome flash
     *
     * @param req
     * @param res
     * @param next
     */
    customeFlashAndErrorReporting: function (req, res, next) {

        req.application.lib.helpers.customeProcessErrorInformation(req, res, next);
        req.application.lib.helpers.customeProcessMsgInformation(req, res, next);

        res.locals.flash = req.flash();

        next();
    },

    /**
     * Session information
     *
     * @param req
     * @param res
     */
    customeProcessErrorInformation: function(req, res, next) {

        if (req.session.error != undefined) {
            if (req.session.error.hasOwnProperty("code")) {
                req.flash("error", "Error: " + req.session.error.code);
            } else {

                req.flash("error", "Validation Error");
                req.errors(req.session.error);

            }

            delete req.session.error;

        }

        res.locals.validationErrors = req.errors();
        
    },
    /**
     * Custome message processing
     *
     * @param req
     * @param res
     * @param next
     */
    customeProcessMsgInformation: function(req, res, next) {
        if (req.session.messages) {
            for (var msg in req.session.messages) {
                if (typeof req.session.messages[msg] == "string") {
                    if (!(res.locals.validationErrors['form_error'] instanceof Array)) {
                        res.locals.validationErrors['form_error'] = [];
                    }

                    res.locals.validationErrors['form_error'].push(req.session.messages[msg])
                }
            }
            req.session.messages = [];
        }
    },
    /**
     * Custome check if object is empty
     *
     * @param obj
     * @returns {boolean}
     */
	isEmptyObject: function(obj) {
		  for(var prop in obj) {
		    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
		      return false;
		    }
		  }
		  return true;
	},
    /**
     * Custome error stripping for excess information
     *
     * @param data
     * @param stage
     * @returns {*}
     */
    stripDBInfoFromError: function(data, stage)
    {
        if (data.hasOwnProperty("code")) {
            delete data.sqlState;
            delete data.index;
            delete data.sql;
        }
        return data;
    },
    /**
     * Capitalize first letter in string
     *
     * @param string
     * @returns {string}
     */
    capitaliseFirstLetter: function(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    /**
     * Get Preset roles
     *
     * @param app
     * @returns {{root: string, superadmin: string, admin: string, user: string, guest: string}}
     */
    getPresetRoles: function(app) {
    	//Todo: Add roles object to res.locals for direct accessabiliy
    	return {"root":"Root","superadmin":"Super Admin","admin":"Admin","user":"User","guest":"Guest"}
    }




};




