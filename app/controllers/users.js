/**
 * User controller
 * Springload - 2014
 * 
 **/

var CRUD = require("../lib/crud");
var user_crud = new CRUD();

user_crud.init({
    controllerPath: __filename,
    useHashId: true,
    templates: {
        index: "admin/list.j2",
        new: "admin/new.j2",
        show: "admin/view.j2",
        edit: "admin/edit.j2"
    },
    structure: {
        index: {
            id: "Id",
            name: "Name",
            email: "Email"
        },
        view: {
            id: "User id",
            name: "Name",
            email: "Email",
            role: {
                name: "Role name"
            },
            created_at: "Created",
            updated_at: "Last updated"
        },
        new: {
        	name: {
                name: "Name",
                placeholder: "Name",
                label: "Full name:"
           },
           email: {
                name: "Email",
                placeholder: "Email",
                label: "Email address:"
           },
           password: {
                name: "Password",
                placeholder: "Password",
                label: "Password:",
                type: "password"
           },
           confirmPassword: {
                name: "Confirm Password",
                placeholder: "Confirm Password",
                label: "Confirm password:",
                type: "password"
           },
           role: {
           		name: "Role",
                placeholder: "Role",
                label: "Role:",
                type: "select",
                func: "lib.helpers.getPresetRoles"
           }
        },
        edit: {
            name: {
                name: "Name",
                placeholder: "Name",
                label: "Full name:"
            },
            email: {
                name: "Email",
                placeholder: "Email",
                label: "Email address:"
            },
            password: {
                name: "Password",
                placeholder: "Password",
                label: "Password:",
                type: "password",
                value: ""
            },
            confirmPassword: {
                name: "Confirm Password",
                placeholder: "Confirm Password",
                label: "Confirm password:",
                type: "password",
                value: ""
            },
            role: {
                name: "Role",
                placeholder: "Role",
                label: "Role:",
                type: "select",
                func: "lib.helpers.getPresetRoles"
            }
        },
        delete: {
            id: "User id",
            name: "Name",
            email: "Email",
            role: {
                name: "Role name"
            },
            created_at: "Created",
            updated_at: "Last updated"
        }
    }
});

/**
 * Override create method
 */
user_crud.create = function(req, res, next)
{
    req.application.db.users.createUser(
        req.body,
        function(result) {
            if (result.status == "success") {
                var user = result.data;
                req.flash("success","Item successfully created!")

                var reDirId = (user_crud.get("useHashId")) ? user.hashId : user.id;

                res.redirect("/users/" + reDirId);

            } else {
                res.redirect("/users/new", 301, result);
            }
        });
}

/**
 * Override update method
 */
user_crud.update = function(req, res, next)
{
    obj = (req.hasOwnProperty("data")) ? req.data : undefined;

    if (obj == undefined) {
        res.redirect("/users", 301, {
            status: "error",
            error: "No item to update!"
        });
    }

    req.application.db.users.updateUser(
        obj.id,
        req.body,
        function(result) {

            var status = result ? result.status : "error",
                reDirId = (user_crud.get("useHashId")) ? obj.hashId : obj.id;

            if (status === "error") {

                req.flash("error","Item couldn't be saved!")
                res.redirect("/users/" + reDirId +"/edit", 301, {
                    status: "error",
                    error: result.data
                });
            } else {
                req.flash("success","Item successfully updated!")

                res.redirect("/users/" + reDirId + "/edit");
            }

        })
}

module.exports = user_crud;
