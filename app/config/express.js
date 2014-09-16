/**
 * Express configuration
 *
 **/

var express = require('express'),
    helpers = require('view-helpers'),
    pkg = require('../../package.json'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    compressor = require('compression'),
    csrf = require('csurf'),
    cookieSession = require('cookie-session'),
    session = require("express-session"),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    favcon = require('serve-favicon'),
    nunjucks = require("nunjucks"),
    flash = require('connect-flash'),
    crypto = require("crypto");


module.exports = function (application) {
	
	var app = application.express(),
	passport = application.passport,
    env = application.options.stage,
    config = application.config,
    renderer;

    app.set('showStackError', true);

	app.use(function (req, res, next) {

        // Add timestamp
        application.options.initTimestamp = process.hrtime();

        // expose application to controller
        req.application = application;
        next();
    });

    // should be placed before express.static
    app.use(compressor({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 9
    }));

    //app.use(favcon(config.root + '/public/favicon.ico'));
    app.use(express.static(config.root + '/public'));
    app.use(express.static(config.root + '/app/views'));
    app.use(express.static(config.root + '/uploads'));

    // don't use logger for test env
    if (app.options.stage !== 'test') {
        app.use(morgan('dev'));
    }

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views');

    renderer = nunjucks.configure('./app/views', {
        autoescape: true,
        express: app
    });

    renderer.addFilter("json", function(str) {
        return JSON.stringify(str);
    });

    // cookieParser should be above session
    app.use(cookieParser());

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.raw({limit: '1024kb'}));
    app.use(bodyParser.json());
    app.use(methodOverride());

    app.use(application.expressValidator({
            errorFormatter: function(param, msg, value) {
                var namespace = param.split('.')
                    , root    = namespace.shift()
                    , formParam = root;

                while(namespace.length) {
                    formParam += '[' + namespace.shift() + ']';
                }
                return {
                    param : formParam,
                    msg   : msg
                };
            }
        }
    ));

    // enable session support
    app.use(cookieSession({
        secret: config.app.secret
    }));

    // Remember Me middleware
    app.use(function (req, res, next) {
        if (req.method === 'POST' && req.url === '/login') {
            if (req.body.remember_me) {
                req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
            } else {
                if (req.session.cookie) {
                    req.session.cookie.expires = false;
                }
            }
        }

        next();
    });

    //Allow to bypass csrf protection when developing by passing api = 1 key value pair
    app.use(function (req, res, next) {

        if (env == "development" && req.param('api') == '1') {
            return csrf({ 
            	cookie: true,
            	ignoreMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
            })(req, res, next);
        } else {
            return csrf({ 
            	cookie: true
            })(req, res, next);
        }

    });

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // create function req.errors for res.locals.validationError
    app.use(application.lib.helpers.customErrorCollector);
    app.use(application.lib.helpers.customeFlashAndErrorReporting);

    // Patch the renderer to be auto by default here...
    app.use(application.configs.middleware.render);
    app.use(application.configs.middleware.redirect);

    // should be declared after session and flash
    app.use(helpers(pkg.name));

    app.use(function (req, res, next) {
        var token = req.csrfToken();
        res.locals._csrf = token;
        next();
    });


    // Local exposures and associations
    app.use(function (req, res, next) {

        // expose user to views
        if (req.user) {
            res.locals.user = req.user;
        }

        // expose package.json to views
        res.locals.pkg = pkg;

        // expose application to controller
        next();
    });


    if ('development' == env) {
        app.locals.pretty = true;
    }


    /**
     * API Security
     */
    app.use(function (req, res, next) {
        var retrievedSignature, parsedUrl, computedSignature;

        if (req.method === "OPTIONS") {
            res.setHeader("Access-Control-Allow-Headers", "X-Signature");
            res.writeHead(204);
            res.end();
        } else {

            // Deal with CORS.
            res.setHeader("Access-Control-Allow-Origin", "*");

            if (!req.query.apikey && !req.body.apikey) {
                next();
                return;
            }

            // Get signature.
            retrievedSignature = req.headers["x-signature"];

            // Recalculate signature.
            computedSignature = crypto.createHmac("sha256", config.sharedSecret).digest("hex");

            if (computedSignature === retrievedSignature) {
                return next();
            } else {
                return res.json(403, {
                    status: "error",
                    data: "Wrong API signature."
                });
            }
        }
    });


    return app;
};
