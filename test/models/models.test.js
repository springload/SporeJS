require('../helpers/chai.js');
var async = require('async');
var faker = require('faker');
var application = require('../spore');

describe('Models', function(){

     beforeEach(function(done){

        async.series([
            function(callback) {
                application.db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0").complete(callback);
            },
            function(callback) {
                application.db.sequelize.sync({force: true}).complete(callback);
            },
            function(callback) {
                application.db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1").complete(callback);
            }]
        , callback);

        function callback(){
            done();
        }

    });

    // User Role test

    it("should check user and role creation and relationship without error", function(done) {
        
        var roleName = faker.definitions.bs_adjective[0];
        var userName = faker.Name.firstName();
        var password = faker.Name.firstName() + faker.Name.lastName() + faker.Name.lastName();

        application.db.roles.create({ role: roleName })
            .then(function(role) {
                // Check role
                expect(role).to.exist;
                application.db.users.createUser({
                    password: password,
                    confirmPassword: password,
                    name: userName,
                    email: faker.Internet.email(),
                    role: roleName
                    },
                    function(result) {
                        application.db.users.find({ where: { name: userName } })
                            .then(function(fetchUser) {
                                // Check user
                                expect(fetchUser).to.exist;
                                expect(fetchUser.get('name')).to.equal(userName);
                                fetchUser.getUserRole()
                                    .then(function(userRole) {
                                        userRole.getRole()
                                            .then(function(role) {
                                                // Check role info
                                                expect(role.get('role')).to.equal(roleName);
                                                done();
                                            });
                                    });
                            });
                    });
            })
            .catch(function(error) {
                done(error);
            });
    });

    // role and user test

    it("should check user and role creation without error", function(done) {

        var roleName = faker.definitions.bs_adjective[0];
        var userName = faker.Name.firstName();
        var password = faker.Name.firstName() + faker.Name.lastName() + faker.Name.lastName();

        application.db.roles.create({ role: roleName })
            .then(function(role) {
                // Check role
                expect(role).to.exist;

                application.db.users.createUser({
                    password: password,
                    confirmPassword: password,
                    name: userName,
                    email: faker.Internet.email(),
                    role: roleName
                    },
                    function(result) {
                        //Check user result
                        expect(result.data).to.exist;
                        done();
                    });
            })
            .catch(function(error) {
                done(error);
            });
    });

    it("should check role without error", function(done) {

        var roleName = faker.definitions.bs_adjective[0];

        application.db.roles.create({ role: roleName })
            .then(function(role) {
                expect(role).to.exist;
                done();
            })
            .catch(function(error) {
                done(error);
            });
    });

    
});