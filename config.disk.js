/**
 * SporeJS - Config file
 * Springload - 2014
 *
 * Supported DB types dialects:
 * 'mysql', 'sqlite', 'postgres', 'mariadb'
 *
 * Caution: Please make sure to set forceRebuild to false after the initial setup
 *
 **/

module.exports = {
    development: {
        db: {
            type: "mysql",
            credentials : {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'spore'
            },
            forceRebuild: false
        },
        app: {
            name: 'SporeJS - Grow your project',
            serverHost: "localhost",
            serverPort: 3000,
            from: "spore@springload.co.nz",
            secret: 'Super secret spored sentence',
            hashIdLength: 12,
            feedback: '',
            appServer: "http://sporeProject.co.nz"
        },
        mail: {
            active: false,
            options: {
                service: 'Gmail',
                auth: {
                    user: "user@googlemail.co.nz",
                    pass: "SporesOfGrowth"

                }
            }
        },
        cache: {
            ttl: 86400,
            checkperiod: 3600
        },
        sharedSecret: "GA98200C7ADB72711991CA8538F7F416762E8817125DD47B1A95F68E0C64C8FH"
    },
    test: {
        db: {
            type: "mysql",
            credentials : {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'spore_test'
            },
            forceRebuild: false
        },
        app: {
            name: 'SporeJS - Grow your project',
            serverHost: "localhost",
            serverPort: 3000,
            from: "spore@springload.co.nz",
            secret: 'Super secret spored sentence',
            hashIdLength: 12,
            feedback: '',
            appServer: "http://sporeProject.co.nz"
        },
        mail: {
            active: false,
            options: {
                service: 'Gmail',
                auth: {
                    user: "user@googlemail.co.nz",
                    pass: "SporesOfGrowth"

                }
            }
        },
        cache: {
            ttl: 86400,
            checkperiod: 3600
        },
        sharedSecret: "GA98200C7ADB72711991CA8538F7F416762E8817125DD47B1A95F68E0C64C8FH"
    },
    production: {
        db: {
            type: "mysql",
            credentials : {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'spore'
            },
            forceRebuild: false
        },
        app: {
            name: 'SporeJS - Grow your project',
            serverHost: "localhost",
            serverPort: 3000,
            from: "spore@springload.co.nz",
            secret: 'Super secret spored sentence',
            hashIdLength: 12,
            feedback: '',
            appServer: "http://sporeProject.co.nz"
        },
        mail: {
            active: false,
            options: {
                service: 'Gmail',
                auth: {
                    user: "user@googlemail.co.nz",
                    pass: "SporesOfGrowth"

                }
            }
        },
        cache: {
            ttl: 86400,
            checkperiod: 3600
        },
        sharedSecret: "GA98200C7ADB72711991CA8538F7F416762E8817125DD47B1A95F68E0C64C8FH"
    }
};

