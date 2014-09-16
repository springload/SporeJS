/**
 * Authentication middleware
 * Springload - 2014
 *
 **/

// Assuming the render API is fairly stable,
// we can just replace the default renderer and
// carry on just the same.
module.exports = function(req, res, next) {
    var render = res.render;
    
    /**
     * Replace default render method
     * @param  {String}   view    Template name
     * @param  {Object}   options Hash of data to go template
     * @param  {Function} fn      Callback
     * @return {Function}         The callback methods, promises etc.
     */
    res.render = function(view, data, options, fn) {

        var self = this,
            data = data || {},
            req = this.req,
            app = req.app,
            defaultFn;

        var _defaultTemplate = 'error.j2';

        // If function is passesd as 2nd param,
        // don't pass any data to the template.
        if ('function' == typeof data) {
            fn = data,
            data = {};
        }

        // By default, returns a template string
        defaultFn = function(err, str){
            
            if (err) {
                return req.next(err);
            }

            self.send(str);
        };

        // If no callback is defined, push out the
        // default callback, which is to print the
        // rendered template as a string
        if ('function' != typeof fn) {
          fn = defaultFn;
        }


        // If no view is passed in, render the default
        if ('string' != typeof view) {
            // return res.json(data);
            view = _defaultTemplate;
        }

        if (options && options.hasOwnProperty('flash')) {
            req.flash(options.status || "message", options.flash);
        }

        if (data) {

            if (data.hasOwnProperty("error")) {
               req.errors(data.error);
            }
            
            if (data.hasOwnProperty("errors")) {
               req.errors(data.errors);
            }
           
            req.errors(res.locals.validationErrors);

            req.application.lib.helpers.customeProcessErrorInformation(req, res, next);

        }

        // Make render use automatical response formatting.
        res.format({
            'json': function(){

                var request = req.route;
				
				if(! data.hasOwnProperty("status")) {
					data.status = "success";
				}

                // Overwrite with error object
				if (! req.application.lib.helpers.isEmptyObject(res.locals.validationErrors)) {

                    data = { status: "error" };
                    data = req.application.lodash.assign(data, res.locals.validationErrors);

				}

                // Add next toekn
                if (request != undefined) {
                    data.csrfToken = res.locals._csrf;
                }

                // Clear extended error msg in production environment
                if (req.application.options.stage == "production") {
                    data = req.application.lib.helpers.stripDBInfoFromError(data);
                }

                // Add user if authenticated
			    if (req.isAuthenticated()) {
			        data.user = req.user;
			    }

                // Create timestamp for nano seconds
                if (data.status != "error") {
                    var diff = process.hrtime(req.application.options.initTimestamp);
                    data.duration = diff[0] + (diff[1]/1000000000);
                }
				
                return res.json(data);
            },
            'html': function() {
                return render.call(self, view, data, function(err, str) {
                    // Do whatever post processing you want
                    fn(err, str);
                });
            },
            'default': function() {
                // log the request and respond with 406
                return res.status(406).send('Not Acceptable');
            }

        })
    };

  next();

}