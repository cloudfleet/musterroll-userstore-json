var fs = require('fs');
var _ = require('lodash');
var bcrypt = require('bcrypt');



var ConfigFileUserStore = function(options)
{
    var config_file_location = (options["config_file_location"] || "data") + "/";
    var config_file_name = options["config_file_name"] || "users.json";

    if(!fs.existsSync(config_file_location))
    {
        fs.mkdirSync(config_file_location);
    }

    var loadConfigFile = function(filename)
    {
        try{
            var fileContent = fs.readFileSync(config_file_location + filename);
            return JSON.parse(fileContent);
        }
        catch (e) {
            console.log("Could not read file " + config_file_location + filename + ", creating empty store");
            return {users:{}};
        }


    };
    var saveConfigFile = function(filename, object)
    {
        fs.writeFileSync(config_file_location + filename + ".tmp", JSON.stringify(object));
        fs.rename(config_file_location + filename + ".tmp", config_file_location + filename);
    };


    var users = loadConfigFile(config_file_name).users;


    var sanitize_user = function(user)
    {
        delete user["password"];
        return user;
    };


    this.authorize = function(username, password)
    {
        var user2bind = users[  username];
        return user2bind && user2bind.password && bcrypt.compareSync(password, user2bind.password);

    };

    this.getUsers = function()
    {
        return users;
    };
    this.getGroups = function()
    {
        return {
            admins: {
                "cn": "admins",
                "gid": 0,
                "member": _(users).where({"isAdmin": true}).pluck("id")
            }
        };
    };
    this.updateUser = function(user)
    {
        users[user["id"]] = user;
        saveConfigFile("users.json", {users: users});
    };
    this.deleteUser = function(user_id)
    {
        delete users[user_id];
        saveConfigFile("users.json", {users: users});
    };

    this.setPassword = function(user_id, password_plain)
    {
        users[user_id]["password"] = bcrypt.hashSync(password_plain,
                                                     bcrypt.genSaltSync());
        users[user_id]["password_set"] = true;
        saveConfigFile("users.json", {users: users});
    };

    this.isInitialized = function()
    {
        return !!_.keys(users).length;
    };

};

module.exports = {
    createUserStore: function(options)
    {
      return new ConfigFileUserStore(options);
    },
    ConfigFileUserStore: ConfigFileUserStore

};
