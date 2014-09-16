/**
 * Authentication middleware
 * Springload - 2014
 *
 **/


/**
 * Generic require login routing middleware
 *
 * @param req
 * @param res
 * @param next
 * @returns {*|Request}
 */
exports.isAuthenticated = function (req, res, next) {

    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;

        req.flash("Please log in to see that.")
        res.redirect("/login");
        return;
    }
    next();
}

exports.notAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/dashboard");
        return;
    }
    next();
}

/**
 * User authentication based on groups
 *
 * @param groups
 * @returns {Function}
 */
exports.hasGroups = function (roles) {

    if (typeof roles == "string") {
        roles = roles.split(" ");
    }

    return function (req, res, next) {
        if (!req.isAuthenticated()) {
            req.session.returnTo = req.originalUrl;
            req.flash("message", "Please log in to see that")
            res.redirect("/login");
        } else {
            req.application.db.users.checkRoleAccess(
                req.user,
                roles,
                function(data) {
                    if (data.status == "success") {
                        next();
                    } else {
                        if (data.hasOwnProperty('url')) {
                            res.redirect(data.url);
                        } else {
                            res.render(data.template, data.data);
                        }
                    }
                }
            )
        }
    }
}


