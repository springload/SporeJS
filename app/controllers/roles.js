/**
 * Role controller
 * Springload - 2014
 * 
 **/

var CRUD = require("../lib/crud");
var role_crud = new CRUD();

role_crud.init({
    controllerPath: __filename,
    useHashId: false,
    templates: {
        index: "admin/list.j2",
        new: "admin/new.j2",
        show: "admin/view.j2",
        edit: "admin/edit.j2"
    },
    structure: {
        index: {
            id: "Role id",
            role: "Roles"
        },
        view: {
            id: "Role id",
            role: {
                name: "Role name"
            },
            created_at: "Created",
            updated_at: "Last updated"
        },
        new: {
            role: {
                name: "Roles",
                placeholder: "Enter new role...",
                label: "New Role"
            }
        },
        edit: {
            role: {
                name: "Roles",
                label: "Role name",
                type: "input"
            }
        },
        delete: {
            id: "Role id",
            role: {
                name: "Role name"
            },
            created_at: "Created",
            updated_at: "Last updated"
        }
    }
});

module.exports = role_crud;
