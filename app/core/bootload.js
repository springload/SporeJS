/**
 * Bootloader
 * Springload - 2014
 *
 **/

/**
 * Base bootloader
 * @param _opts
 * @constructor
 */
function BootLoader(_opts) {
	var opts = {};
	
	if (_opts == null) throw new Error("Options and Core missing");
	for (var opt in _opts) opts[opt] = _opts[opt]
	
	if (opts.core == null) throw new Error("Core missing");
	
	this.core = opts.core;
	delete opts.core;
	
	this.options = opts; 
	
}

/**
 * Builds Application
 * @returns {BootLoader}
 */
BootLoader.prototype.load = function()  {
	var _this = this,
        _ =_this.core.lodash;

    _this = _.assign(_this, _this.core);
    delete _this.core;

    _this.config = _this.configs.config[_this.options.stage];
    _this.config.root = _this.path.normalize(__dirname + '/../..');
	
    _this.db = _this._initDataBase(_this);
    _this.mail = _this._initMail(_this);
    _this.passport = _this.configs.passport(_this);
	_this.app = _this.configs.express(_this);
	_this.routes = _this.configs.routes(_this);
    _this.cache = _this._initCache(_this);

	return _this;
}

/**
 * Create Mailer
 */

BootLoader.prototype._initMail = function(app) {
    var _this = this,
        _config = app.config.mail;

    if (_config.active) {
        return app.nodemailer.createTransport('SMTP', _config.options);
    }

    return false;

}

/**
 * Start node server
 */
BootLoader.prototype.runServer = function()  {

    var _this = this,
        _config = _this.config;

    // Starting the server.... duhh
    _this.http.createServer(_this.app).listen(_config.app.serverPort, _config.app.serverHost, function(){
        console.log("                                               ");
        console.log(" _____                             ___  _____  ");
        console.log("/  ___|                           |_  |/  ___| ");
        console.log("\\ `--.  _ __    ___   _ __  ___     | |\\ `--.  ");
        console.log(" `--. \\| '_ \\  / _ \\ | '__|/ _ \\    | | `--. \\ ");
        console.log("/\\__/ /| |_) || (_) || |  |  __//\\__/ //\\__/ / ");
        console.log("\\____/ | .__/  \\___/ |_|   \\___|\\____/ \\____/  ");
        console.log("       | |                                     ");
        console.log("       |_|                                     ");
        console.log("                                               ");
        console.log( _config.app.name + ': listening on port ' + _config.app.serverPort);
        console.log("\n");
    });
}

/**
 * Initialise database
 * @param app
 * @returns {*|void}
 * @private
 */
BootLoader.prototype._initDataBase = function(app)  {

	var _this = this,
	db = {},
    seq = app.sequelize,
    config = app.config,
    models = app.models;

	dbHandler = new seq(config.db.credentials.database, config.db.credentials.user, config.db.credentials.password, {
    	  
    	// custom host; default: localhost
		host: config.db.credentials.host,
		 
		// custom port; default: 3306
		port: (config.db.credentials.port != undefined) ? config.db.credentials.port : 3306,
		  
		dialect: config.db.type,

        logging: false,
		  
        define: {
            collate: 'utf8_general_ci',
            underscored: true,

            classMethods: {
                getDb: function() {
                    return app.db
                },
                getApplication: function() {
                    return app
                }
            }
        }
  	});

   	Object.keys(models).forEach(function(modelName) {
	    db[modelName] = dbHandler.import(modelName, models[modelName]);
        db[modelName].app = _this;

    });
	
	Object.keys(db).forEach(function(modelName) {

	    if ('associate' in db[modelName]) {
	        db[modelName].associate(db)
	    }
	    
		// Todo: Add crud methods
  
	});
	
    // Do some freake sequelize stuff (possible forcefull rebuild on sync)
	var seqObj = _this.lodash.extend({
	    sequelize: dbHandler
	}, db);

    if (config.db.forceRebuild) {
        seqObj.sequelize
            .query('SET FOREIGN_KEY_CHECKS = 0')
            .then(function(){
                return _this.db.sequelize.sync({ force: true });
            })
            .then(function() {
                _this._initMigrations(app, seqObj);
            })
            .then(function(){
                return _this.db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
            })
            .then(function(){
                console.log('Database synchronised.');
            }, function(err){
                throw err[0];
            });
    } else {
        seqObj.sequelize
            .sync({ force: false })
            .then(function() {
                _this._initMigrations(app, seqObj);
            })
            .then(function(){
                console.log('Database synchronised.');
            }, function(err){
                throw err[0];
            });
    }

    // return final Sequelize object
    return seqObj;

}

/**
 * Initialise migrations
 *
 * @param app
 * @param seqObj
 * @private
 */
BootLoader.prototype._initMigrations = function(app, seqObj)  {
    var _this = this;

    // Check and run migrations
    process.argv.forEach(function (val, index, array) {

        if (val == "--run-migration") {
            _this.db.sequelize.getMigrator({ path: app.options.migrationPath, filesFilter: /\.js$/ }).migrate();

            return _this.sequelize_fixtures.loadFile(app.options.fixturesPath, _this.db, function(){
                        console.log('Fixtures loaded.');
             });
        }
    });
}

/**
 * Initialise cache
 * @param app
 * @returns {*|void}
 * @private
 */
BootLoader.prototype._initCache = function(app)  {
    var _this = this;
    return new _this.cache({ stdTTL: app.config.cache.ttl, checkperiod: app.config.cache.checkperiod });
}

BootLoader.prototype._set = function(name, value)  {
  this[name] = value;
}

BootLoader.prototype._get = function(name)  {
	return this[name];
}

exports.init = function(options) {
  return new BootLoader(options).load();
};
	