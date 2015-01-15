var assert = require("assert");
var index = require("../index");
describe('ConfigFileUserStore', function(){
    describe('#setPassword()', function(){
        it('should hash password', function(){
            var store = index.createUserStore(
                {"config_file_location": ".",
                 "config_file_name": "test.json"}
            );
            var name = 'joe';
            var password = 'secret';
            store.updateUser({'id': name});
            var users = store.getUsers();
            assert.equal(users[name]['id'], name);
            store.setPassword(name, password);
            assert.notEqual(store.getUsers()[name]['password'], password);
            assert.equal(store.authorize(name, password), true);
        });
    });
});
