/**
 * CRUD Class
 * Springload - 2014
 *
 * Authors:
 * Dave Cartwright
 *
 **/

function CRUD()
{
    var _this;

    /**
     * Initiate
     * @param opt
     */
    this.init = function(opt)
    {
        _this = this;

        if (typeof opt == "object") {
            
            if (opt.hasOwnProperty("controllerPath") && typeof opt.controllerPath == "string") {

                var pathList = opt.controllerPath.split("/"),
                    filePartList = pathList[(pathList.length-1)].split(".");

                _this.set("modelName", filePartList[0]);

            }

            if (opt.hasOwnProperty("structure") && typeof opt.structure == "object") {
                _this.set("config", opt.structure);
            }

            if (opt.hasOwnProperty("templates") && typeof opt.templates == "object") {
                _this.set("templates", opt.templates);
            }

            if (opt.hasOwnProperty("useHashId") && typeof opt.useHashId == "boolean" && opt.useHashId == false) {
                _this.set("useHashId", false);
            } else {
                _this.set("useHashId", true);
            }


        }
    }

    /**
     * Index controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.index = function (req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            template = (_this.getTemplate("index") != undefined) ? _this.getTemplate("index") : "admin/list.j2";

        model.findAll()
            .success(function (data) {

                var response = _this.getStructuredData(data, _this.getStructure("index"));
                response.model = _this.get("modelName");
                response.useHashId = _this.get("useHashId");

                res.render(template, response);

            })
            .error(function (error) {
                res.render(template, {
                    status: "error",
                    error: error
                })
            })
    }

    /**
     * View controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.view = function (req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            template = (_this.getTemplate("view") != undefined) ? _this.getTemplate("view") : "admin/view.j2";

        model.find({
            where: {id: parseInt(req.id)}
        })
            .success(function(data) {
                if (data) {

                    var response = _this.getStructuredData(data, _this.getStructure("view"));
                    response.model = _this.get("modelName");
                    response.useHashId = _this.get("useHashId");

                    res.render(template, response);

                } else {
                    res.render("error.j2", {
                        status: "error",
                        error: "No item found"
                    })
                }
            })
            .error(function(error) {
                res.render({
                    status: "error",
                    error: error
                });
            });
    }

    /**
     * New controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.new = function(req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            template = (_this.getTemplate("new") != undefined) ? _this.getTemplate("new") : "admin/new.j2";

        model.describe()
            .success(function(data) {

                var response = _this.getStructuredData(data, _this.getStructure("new"));
                response.model = _this.get("modelName");
                response.useHashId = _this.get("useHashId");
				
				console.log(response),
				
                res.render(template, response);

            })
            .error(function(error) {
                res.render(template, {
                    status: "error",
                    error: error
                })
            })
    }

    /**
     * Create controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.create = function(req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
        	createMethod = (_this.getCreateMethod()) ? _this.getCreateMethod() : "create";
		
        model[createMethod](req.body)
            .success(function(data) {

                item = data.get();
				req.flash("success","Item successfully created!")
				
                var reDirId = (_this.get("useHashId")) ? item.hashId : item.id;

                res.redirect("/" + _this.get("modelName") + "/" + reDirId);

            })
            .error(function(error) {

                res.redirect("/" + _this.get("modelName") + "/new", 301, {
                    status: "error",
                    error: error
                });
            })

    }

    /**
     * Update controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.update = function(req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            obj = (req.hasOwnProperty("dataRaw")) ? req.dataRaw : undefined;

        if (obj == undefined) {
            res.redirect("/" + _this.get("modelName"), 301, {
                status: "error",
                error: "No item to update!"
            });
        }

        obj.updateAttributes(req.body)
            .success(function(data) {

                item = data.get();
                req.flash("success","Item successfully updated!")

                var reDirId = (_this.get("useHashId")) ? item.hashId : item.id;

                res.redirect("/" + _this.get("modelName") + "/" + reDirId + "/edit");


            })
            .error(function(error) {

                var reDirId = (_this.get("useHashId")) ? req.data.hashId : req.data.id;

                res.redirect("/" + _this.get("modelName") + "/" + reDirId + "/edit", 301, {
                    status: "error",
                    error: error
                });
            })

    }

    /**
     * Edit controller
     *
     * @param req
     * @param res
     * @param next
     */
	this.edit = function (req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            template = (_this.getTemplate("edit") != undefined) ? _this.getTemplate("edit") : "admin/edit.j2";

        model.find({
            where: {id: parseInt(req.id)}
        })
        .success(function(data) {
            if (data) {

                var response = _this.getStructuredData(data, _this.getStructure("edit"));
                response.model = _this.get("modelName");
                response.useHashId = _this.get("useHashId");

                res.render(template, response);

            } else {
                res.render("error.j2", {
                    status: "error",
                    error: "No item found"
                })
            }
        })
        .error(function(error) {
            res.render({
                status: "error",
                error: error
            });
        });
    }

    /**
     * Delete controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.delete = function (req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            template = (_this.getTemplate("delete") != undefined) ? _this.getTemplate("delete") : "admin/delete.j2";

        model.find({
            where: {id: parseInt(req.id)}
        })
        .success(function(data) {
            if (data) {

                var response = _this.getStructuredData(data, _this.getStructure("delete"));
                response.model = _this.get("modelName");
                response.useHashId = _this.get("useHashId");

                res.render(template, response);

            } else {
                res.render("error.j2", {
                    status: "error",
                    error: "No item found"
                })
            }
        })
        .error(function(error) {
            res.render({
                status: "error",
                error: error
            });
        });
    }

    /**
     * Remove controller
     *
     * @param req
     * @param res
     * @param next
     */
    this.remove = function(req, res, next)
    {
        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            obj = (req.hasOwnProperty("dataRaw")) ? req.dataRaw : undefined;

        if (obj == undefined) {
            res.redirect("/" + _this.get("modelName"), 301, {
                status: "error",
                error: "No item to remove!"
            });
        }

        obj.destroy()
            .success(function(data) {

                req.flash("success","Item successfully deleted!")
                res.redirect("/" + _this.get("modelName"));

            })
            .error(function(error) {

                var reDirId = (_this.get("useHashId")) ? req.data.hashId : req.data.id;

                res.redirect("/" + _this.get("modelName") + "/" + reDirId + "/delete", 301, {
                    status: "error",
                    error: error
                });
            })

    }

    /**
     * Find either by hashid or id
     *
     * @param req
     * @param res
     * @param next
     * @param multi
     */
    this.findMultiId = function(req, res, next, multi)
    {
        if (isNaN(multi)) {
            _this.findHashId(req, res, next, multi);
        } else {
            _this.findId(req, res, next, multi);
        }
    }

    /**
     * Find hash id
     *
     * @param req
     * @param res
     * @param next
     * @param hashId
     */
    this.findHashId = function(req, res, next, hashId)
    {

        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            app = _this.getApp();

        var id = app.lib.utils.unHashId(app, hashId);

        model.find({
            where: {id: parseInt(id)}
        })
        .success(function(data) {
            if (data) {

                item = data.get();

                req.data = item;
                req.dataRaw = data;
                req.id = item.id;

                next();

            } else {
                res.render("error.j2", {
                    status: "error",
                    error: "No item found"
                })
            }
        })
        .error(function(error) {
            res.render({
                status: "error",
                error: error
            });
        });

    };

    /**
     * Find regular id
     *
     * @param req
     * @param res
     * @param next
     * @param id
     */
    this.findId = function(req, res, next, id)
    {

        _this.setApp(req.application);
        _this.checkModel(next);

        var model = req.application.db[_this.get("modelName")],
            app = _this.getApp();

        model.find({
            where: {id: parseInt(id)}
        })
            .success(function(data) {
                if (data) {

                    item = data.get();

                    req.data = item;
                    req.dataRaw = data;
                    req.id = item.id;

                    next();

                } else {
                    res.render("error.j2", {
                        status: "error",
                        error: "No item found"
                    })
                }
            })
            .error(function(error) {
                res.render({
                    status: "error",
                    error: error
                });
            });

    };

    /**
     * Check if model was set
     * @param next
     */
    this.checkModel = function(next)
    {
        if (_this.get("modelName") == undefined) {
            console.log("Model undefined.");
            next();
        }
    }

    /**
     * get structure or return undefined
     *
     * @param action
     * @returns {*}
     */
    this.getStructure = function(action)
    {
        return (_this.get("config").hasOwnProperty(action)) ? _this.get("config")[action] : undefined;
    }

    /**
     * get template or return undefined
     *
     * @param action
     * @returns {*}
     */
    this.getTemplate = function(action)
    {
        return (_this.get("templates").hasOwnProperty(action)) ? _this.get("templates")[action] : undefined;
    }

    /**
     * Build vol object from structure
     *
     * @param structure
     * @returns {object}
     */
    this.getColsFromStructure = function(structure, base)
    {

        if (structure == undefined) {
            structure = base;
        }

        var cols = {};

        for (key in structure) {

            if (typeof structure[key] == "string") {

                cols[key] = structure[key];

            } else if (typeof structure[key] == "object") {
                if (structure[key].hasOwnProperty("name")) {

                    cols[key] = structure[key].name;

                } else {
                    cols[key] = key;
                }
            }
        }

        return cols;
    }

    /**
     * Create structured data
     *
     * @param data
     * @param structure
     * @param inputExcludes
     * @returns {object}
     */
    this.getStructuredData = function (data, structure)
    {
        var result = {
            status: "success"
        }

        var isList = (Object.prototype.toString.call(data) == "[object Array]") ? true : false;

        if (data.hasOwnProperty("dataValues") && !isList) {
            data = data.get();
        }

        var base = _this.baseResponse(data);

        result["cols"] = (isList) ? _this.getColsFromStructure(structure, base[0]) : _this.getColsFromStructure(structure, base);

        if (isList) {

            result["data"] = [];
            for (key in base) {

                result["data"].push(_this.applyStructure(base[key], structure));
            }

        } else {
            result["data"] = _this.applyStructure(base, structure);
        }

        return result;
    }

    /**
     * Apply structure to data
     *
     * @param base
     * @param structure
     * @returns {object}
     */
    this.applyStructure = function(base, structure)
    {
        var app = _this.getApp();
        
        if (typeof base != "object") {
            return base;
        }

        for(key in base) {
			
			base[key]["label"] = app.lib.helpers.capitaliseFirstLetter(key);
			base[key]["placeholder"] = "Enter " + key + "...";
			
			if (key == "id" || key == "hashId") {
                base[key]["type"] = "hidden";
            }
			
			if (structure != undefined) {
			
	            if (! structure.hasOwnProperty(key)) {
	                if (key != "id" && key != "hashId") {
	                    delete base[key];
	                } 
	            } else if (typeof structure[key] == "object") {
	
	                var overrideValueFunc = (structure[key].hasOwnProperty("func")) ? structure[key].hasOwnProperty("func") : false;
					
	                for (sub in structure[key]) {
	                	base[key][sub] = structure[key][sub];
	                }
	                
	                if (base[key].hasOwnProperty("func")) {
        				var commandStruc = base[key]["func"].split(".");
        				caller = app;
        				for (sub in commandStruc) {
        					caller = caller[commandStruc[sub]]
        				}
        				base[key]["value"] = caller(app);
        			}
	                
	            } else {
	                base[key]["name"] = structure[key];
	            }
	    	}
        }
        
        if (structure != undefined) {
        	for (key in structure) {
        		if (! base.hasOwnProperty(key)) {
        			base[key] = structure[key];
        			base[key]["field"] = key;
        			
        			if (base[key].hasOwnProperty("func")) {
        				var commandStruc = base[key]["func"].split(".");
        				caller = app;
        				for (sub in commandStruc) {
        					caller = caller[commandStruc[sub]]
        				}
        				base[key]["value"] = caller(app);
        			}
        			
        		}
        	}
        }

        return base;
    }

    /**
     * Create base response for all calls
     *
     * @param data
     * @returns {object}
     */
    this.baseResponse = function(data)
    {
        var result = {},
            app = _this.getApp();

        // Base is a list
        if (Object.prototype.toString.call(data)== "[object Array]") {
            result = [];

            for (key in data) {

                if (data[key].hasOwnProperty("dataValues")) {
                    data[key] = data[key].get();
                }

                var row = {};

                for (sub in data[key]) {

                    data[key][sub] = (Object.prototype.toString.call(data[key][sub]) == "[object Object]") ? "" : data[key][sub];

                    row[sub] = {
                        field: sub,
                        name: app.lib.helpers.capitaliseFirstLetter(sub),
                        value: data[key][sub]

                    };
                }

                result.push(row);

            }

        } else {
            for (key in data) {

                data[key] = (Object.prototype.toString.call(data[key]) == "[object Object]") ? "" : data[key];

                result[key] = {
                    field: key,
                    name: app.lib.helpers.capitaliseFirstLetter(key),
                    value: data[key]
                };
            }
        }

        return result;
    }

    /**
     * Set application wrapper
     * @param application
     */
    this.setApp = function(application)
    {
        _this.set("application", application);
    }

    /**
     * Get application wrapper
     * @returns {*|Array|String|promise|Request}
     */
    this.getApp = function()
    {
        return _this.get("application");
    }

	this.setCreateMethod = function(name) 
	{
		_this.set("createMethod", name);
	}
	this.getCreateMethod = function() 
	{
		_this.get("createMethod");
	}

    /**
     * Public setter
     *
     * @param name
     * @param property
     */
    this.set = function(name, property)
    {
        _this[name] = property;
    }

    /**
     * Public getter
     *
     * @param name
     * @returns {*}
     */
    this.get = function(name)
    {
        return _this[name];
    }

}

module.exports = CRUD;