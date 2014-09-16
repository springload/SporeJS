/**
 * SporeJS - Efficient, fast and robust PAC (Presentation Abstraction Control) Framework.
 * Springload - 2014
 *
 * Authors:
 * Dave Cartwright <dave@springload.co.nz>
 * Josh Barr <josh@springload.co.nz>
 * Jordi Tablada <jordi@springload.co.nz>
 *
 **/

/**
 *
 * Include core, bootstrap application and startup server.
 *
 * All items passed through the "requires" object will later be available in the application scope.
 * (e.g. application.lib.utils.method)
 * Load files, installed node packages or directories into the application scope.
 *
 *
 **/

require('./app/core/core').boot({
    stage: (process.env.NODE_ENV) ? process.env.NODE_ENV : 'development',
    requires: {
        lib: "./app/lib"
    }
}, function(base) {

    var application = base.bootLoader.init({
        core: base
    });

    application.runServer();

});

