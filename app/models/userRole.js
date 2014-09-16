/**
 * UserRole model
 * Springload - 2014
 *
 **/

module.exports = function (sequelize, DataTypes) {
    var UserRole = sequelize.define('userRole', {
    	user_id: {
		    type:          DataTypes.INTEGER,
		    references:    'users',
		    referencesKey: 'id',
		    onDelete:      'cascade'
		  }
    }, {
        tableName: 'user_roles',
        classMethods: {
            associate: function (models) {
                UserRole.belongsTo(models.roles)
                UserRole.belongsTo(models.users)
            }
        }
    })

    return UserRole
}