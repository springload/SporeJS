/**
 * Core
 * Springload - 2014
 *
 **/

function Core(_opts) {
    var opts = {
        "requires": {
            "express": "express",
            "configs": "./app/config",
            "models": "./app/models",
            "controllers": "./app/controllers",
            "passport" : "passport",
            "sequelize": "sequelize",
            "sequelize_fixtures": "sequelize-fixtures",
            "http": "http",
            "nodemailer": "nodemailer",
            "path": 'path',
            "cache": "node-cache",
            "expressValidator" : "express-validator",
            "bootLoader": "./app/core/bootload"
            }
        },
        fs = require('fs'),
        lodash = require('lodash'),
        path =  require('path');
	
	if (_opts == null) _opts = {};
	for (var opt in _opts) {
		if ( typeof(_opts[opt]) === "object" ) {
			opts[opt] = lodash.assign(opts[opt], _opts[opt]);
		}
		else {
			opts[opt] = _opts[opt];
		}
	}
	if (opts.requires == null) opts.requires = {};
	if (opts.rootPath == null) opts.rootPath = process.cwd() + '/';
	if (opts.stage == null) opts.stage = 'development';
    if (opts.migrationPath == null) opts.migrationPath = process.cwd() + '/migrations';
    if (opts.fixturesPath == null) opts.fixturesPath = process.cwd() + '/migrations/fixtures.yaml';

	this.options = opts; 
	
	this._set("fs", fs);
	this._set("lodash", lodash);
	this._set("path", path);
	
}

Core.prototype.init = function(callback)  {
	var _this = this,
	opt = _this.options;

	for (var ref in opt.requires)  {
		if (ref != null && opt.requires[ref] != null) {
			
			if (opt.requires[ref].indexOf("./") >= 0) {
				opt.requires[ref] = opt.requires[ref].replace("./", opt.rootPath);
			
				if (_this.fs.existsSync(opt.requires[ref])) {
				    // Add files in folder
				    _this._addReqLibary(ref, opt.requires[ref], _this)    
				} else if (_this.fs.existsSync(opt.requires[ref] + '.js')) {
					// Add file
					_this._addRequire(ref, opt.requires[ref]);
				}
			} else if (_this._get(ref) == undefined) {
				_this._addRequire(ref, opt.requires[ref]);		
			}		
		} 
	}
	
	callback(_this)
}

Core.prototype._addRequire = function(_name, _require) {
	var _this = this;
	_this._set(_name, require(_require))
} 

Core.prototype._addReqLibary = function(_name, _folder, _memory) {
	var _this = this;
	_memory[_name] = {};
	
	_this.fs.readdirSync(_folder)
		.filter(function(file) {
			return (file.indexOf('.') !== 0)
		})
		.forEach(function(file) {
			filename = file.split(".");
			
			if (_this.fs.existsSync(_folder + '/' + filename[0])) {
				_this._addReqLibary(filename[0], _folder + '/' + filename[0], _memory[_name])
			} else {
				_memory[_name][filename[0]] = require(_folder + '/' + filename[0]);
			}
		});
}

Core.prototype._checkFilePath = function(_file, _path) {

}

Core.prototype._set = function(name, value)  {
  this[name] = value;
}

Core.prototype._get = function(name)  {
	return this[name];
}

exports.Core = Core;

exports.boot = function(options, callback) {
  return new Core(options).init(callback);
};

