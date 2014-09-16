module.exports = {
    up: function(migration, DataTypes, done) {

        migration.addIndex(
            'user_roles',
            ['user_id'],
            {
                indicesType: 'UNIQUE'
            }
        );
        
        done();
    },
    down: function(migration, DataTypes, done) {

        migration.removeIndex('user_roles', ['user_id']);

        done();
    }
}
