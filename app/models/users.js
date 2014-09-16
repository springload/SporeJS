/**
 * User model
 * Springload - 2014
 *
 **/

var utils = require('../lib/utils.js');

module.exports = function (sequelize, DataTypes) {

    var User = sequelize.define('users', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
            validate: {
                notEmpty: {
                    msg: "Please enter a name"
                },
                min: {
                    args: 3,
                    msg: "Your name needs to be at least 3 characters long"
                }
            },
            set: function (v) {

                this.setDataValue('name', v);

                // create access key
                var randomA = utils.makeSalt();
                var randomB = utils.makeSalt();

                var key = utils.encryptPassword(randomA, randomB);

                this.setDataValue('apikey', key);
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Please enter an email address"
                },
                isEmail: {
                    msg: "Please check the format of your email address"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Please enter a password"
                },
                min: {
                    args: 6,
                    msg: "Your password needs to be at least 6 characters long"
                }
            },
            set: function (v) {

                // encrypt password
                var salt = utils.makeSalt();
                this.setDataValue('salt', salt);
                this.setDataValue('password', utils.encryptPassword(v, salt));

                // create access key
                var randomA = utils.makeSalt();
                var randomB = utils.makeSalt();

                var key = utils.encryptPassword(randomA, randomB);

                this.setDataValue('access_key', key);

            }
        },
        salt: { type: DataTypes.STRING },
        allow_access_key: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            unique: false,
            defaultValue: false
        },
        access_key: { type: DataTypes.STRING },
        apikey: { type: DataTypes.STRING },
        resetPasswordToken: { type: DataTypes.STRING },
        resetPasswordExpires: { type: DataTypes.DATE }

    }, {
        tableName: 'users',
        classMethods: {
            associate: function (models) {
                User.hasOne(models.userRole);
            },
            getById: function (id, callback) {
                var db = this.getDb();

                db.users.find({where: {id: parseInt(id)}, include: [ db.userRole ]})
                    .success(function (item) {
                        if (item) {
                            callback(null, item)
                        } else {
                            callback({
                                status: "error",
                                data: "No Item found"
                            }, null);
                        }
                    })
                    .error(function (error) {
                        callback({
                            status: "error",
                            data: "No Item found"
                        }, null);
                    });
            },
            getUserByEmail: function (email) {
                var db = this.getDb();

                return db.users.find({where: {email: email}, include: [ db.userRole ]});
            },
            getUserRole: function (user ,callback){
                var db = this.getDb();

                db.userRole.find({ where: { user_id: user.id } })
                    .success(function (item) {
                        if (item) {
                            db.roles.find({ where: { id: item.role_id } })
                                .success(function (role) {
                                    if (role) {
                                        callback({
                                            status: "success",
                                            data: role
                                        })
                                    } else {
                                        callback({
                                            status: "error",
                                            data: "An error has occurred."

                                        })
                                    }
                                });
                        } else {
                                callback({
                                    status: "error",
                                    data: "An error has occurred."
                                })
                            }
                        })
                        .error(function (error) {
                            callback({
                                status: "error",
                                data: error
                            })
                        });
            },
            checkRoleAccess: function (user, roles ,callback){
                var db = this.getDb();

                db.userRole.find({ where: { user_id: user.id } })
                    .success(function (item) {
                        if (item) {
                            db.roles.find({ where: { id: item.role_id } })
                                .success(function (role) {
                                    if (role && roles.indexOf(role.role) >= 0) {
                                        callback({
                                            status: "success"
                                        })
                                    } else {
                                        callback({
                                            status: "error",
                                            flash: "Insufficient access, please log in to see that.",
                                            url: "/login"
                                        })
                                    }
                                });
                        } else {
                            callback({
                                status: "error",
                                flash: "An error has occurred here."
                            })
                        }
                    })
                    .error(function (error) {
                        callback({
                            status: "error",
                            flash: "An error has occurred.",
                            data: error
                        })
                    });
            },
            createUser: function (params ,callback) {
                var db = this.getDb();

                var confirmPassErr = db.users.checkPasswordEquality(params.password, params.confirmPassword);
                if (db.users.checkPasswordEquality(params.password, params.confirmPassword)) {

                    db.roles.find({ where: { role: params.role } })
                        .success(function(role) {

                            if (role != null) {
                                db.users.create(params)
                                    .success(function(user) {

                                        db.userRole.create().success(function(urole) {
                                            urole.setRole(role).success(function() {
                                                urole.setUser(user).success(function() {
                                                    db.users.find({
                                                        where: {id: parseInt(user.id)}, include: [ db.userRole ]
                                                    })
                                                        .success(function(userback) {
                                                            callback({
                                                                status: "success",
                                                                data: userback
                                                            });
                                                        });
                                                });
                                            });
                                        });

                                    })
                                    .error(function(error) {
                                        callback({
                                            status: "error",
                                            error: error
                                        });
                                    });
                            } else {
                                callback({
                                    status: "error",
                                    flash: "Validation Error!",
                                    error: { role: ["Role doesn't exist."] }
                                });
                            }
                        })
                        .error(function(error) {
                            callback({
                                status: "error",
                                error: error
                            });
                        });
                } else {
                    callback({
                        status: "error",
                        flash: "Validation Error!",
                        error: { confirmPassword: ["Your passwords aren't the same."] }
                    });
                }
            },
            findOrCreateUser: function(search, params) {
                var db = this.getDb();

            	db.users.find({
            		where: search
            	}).success(function(user) {
            		return user;
            	}).error(function(error) {
                    db.users.createUser(params, function(result) {
                    	return result;
                    });
                });
            },
            checkPassword: function(user, password) {
                var app = this.getApplication()

                var pass = app.lib.utils.encryptPassword(password, user.salt);
                return pass === user.password;
            },
            checkPasswordEquality: function(password, confirmPassword) {
                if (confirmPassword && password == confirmPassword) {
                    return true;
                }
                return false;
            },
            updateUser: function (userId, params , callback) {
                var db = this.getDb();

                db.roles.find({ where: { role: params.role } })
                    .success(function(role) {
                        db.users.find({ where: {id: userId}, include: [ db.userRole ]})
                        .success(function(userItem) {
                            if (userItem) {
                                userItem.updateAttributes(params)
                                .success(function(updateitem) {

                                        userItem.getUserRole()
                                        .success(function(userRole) {

                                            if (! role) {
                                                db.users.find({
                                                    where: { id: parseInt(updateitem.id)}, include: [ db.userRole ]
                                                })
                                                    .success(function(updatedUser) {
                                                        callback({
                                                            status: "success",
                                                            data: updatedUser
                                                        });
                                                    });
                                            } else {
                                                userRole.setRole(role).success(function() {
                                                    userRole.setUser(updateitem).success(function() {
                                                        db.users.find({
                                                            where: { id: parseInt(updateitem.id)}, include: [ db.userRole ]
                                                        })
                                                            .success(function(updatedUser) {
                                                                callback({
                                                                    status: "success",
                                                                    data: updatedUser
                                                                });
                                                            });
                                                    });
                                                });
                                            }

                                        })
                                        .error(function(error) {
                                            callback({
                                                status: "error",
                                                data: error
                                            });
                                        })
                                })
                                .error(function(error) {
                                    callback({
                                        status: "error",
                                        data: error
                                    });
                                });
                            } else {
                                callback({
                                    status: "error",
                                    data: "No User for update found."
                                });
                            }
                    });
                    });
            }
        },
        setterMethods: {
            confirmPassword: function (confirmPassword) {
                var salt = this.getDataValue('salt');
                this.setDataValue('confirmPassword', utils.encryptPassword(confirmPassword, salt));
            },
            url: function(rootURL) {
                var url =  rootURL +  "/access/" + this.getDataValue("access_key");
                return this.setDataValue('url',url);
            }
        },
        getterMethods: {
            hashId: function() {
                var app = User.getApplication();

                return utils.hashId(app, this.getDataValue('id'))
            },
            url: function() {
                return this.getDataValue('url')
            },
            role: function() {

                try {
                    return this.getDataValue('userRole').role.role
                } catch(e) {
                    return false;
                }
            },
            deleteAccountPhrase: function() {
                return "please delete my account forever";
            }
        }
    })

    return User
}


