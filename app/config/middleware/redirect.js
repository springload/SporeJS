/**
 * Authentication middleware
 * Springload - 2014
 *
 **/

// Hook the main redirect method so we can add custom
// data to it. Supports 1 or 2 arg format as per the
// express documentation.
module.exports = function(req, res, next) {
    var redirect = res.redirect;

    res.redirect = function(url, status, data) {

		req.session.fromRedirect = true;
		
        if (Object.keys(res.locals.flash).length > 0) {
            req.session.flash = res.locals.flash;
        }

        if (data) {
            var type = "message";
            if (data.hasOwnProperty("status")) {
                type = data.status;
            }

            if (data.hasOwnProperty("flash")) {
                req.flash(type, data.flash);
            }

            if (data.hasOwnProperty("data")) {
                req.session.data = data.data;
            } else if (data.hasOwnProperty("error")) {
                req.session.error = data.error;
            }
        }

        if (status) {
            if ('number' == typeof url) {
              status = url;
              url = arguments[1];
            } else {
              status = arguments[1];
            }
            if ('number' == typeof status) {

                console.log("Now redirecting...");

                return redirect.call(res, status, url)
            }
        }


        return redirect.call(res, url);
    }

    next();
}
