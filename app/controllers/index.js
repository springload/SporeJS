/**
 * Index controller
 * Springload - 2014
 *
 **/


/**
 * GET /
 *
 * public marketing page
 * @param req
 * @param res
 */

exports.home = function (req, res) {
    if (! req.isAuthenticated()) {
        res.render("index.j2", {});
    } else {
        res.redirect("/dashboard");
    }
};



/**
 * GET /dashboard
 *
 * Default route for logged-in users
 *
 * @param req
 * @param res
 */
exports.dashboard = function(req, res, next) {
    var app = req.application;
    var role;

    app.db.users.getUserRole(req.user, function(data) {

        if (data.status === "success") {
            role = data.data.role;

            var result = {
                status: "success",
                data: {
                    role: role,
                    models: []
                }
            };

            for (key in app.db) {

                var exclude = ["userRole", "sequelize"];

                if (exclude.indexOf(key) < 0) {
                    result["data"].models.push(key);
                }
            }

            switch(role) {
                case "admin":
                case "superadmin":
                case "root":
                    res.render("admin/dashboard.j2", result);
                    break;
                case "user":
                case "guest":
                    res.render("index.j2", {});
                    break;
                default:
                    res.redirect("/");
                    break;
            }

        } else {
            res.render(null, result.data, {
                status: "error",
                flash: "An error occurred"
            })
        }
    })
};