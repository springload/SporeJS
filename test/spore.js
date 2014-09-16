
require('../app/lib/core').boot({
    stage: "test",
    requires: {
        "lib": "./app/lib"
    }
}, function(base) {

    var application = base.bootLoader.init({
        core: base
    });

    application.runServer();
    module.exports = application;

});

