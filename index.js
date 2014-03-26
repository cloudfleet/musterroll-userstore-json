var fs = require('fs');
var _ = require('lodash');
var scrypt = require('scrypt');



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
            return {};
        }


    };
    var saveConfigFile = function(filename, object)
    {
        fs.writeFileSync(config_file_location + filename + ".tmp", JSON.stringify(object));
        fs.rename(config_file_location + filename + ".tmp", config_file_location + filename);
    };


    var users = loadConfigFile(config_file_name);


    var sanitize_user = function(user)
    {
        delete user["password"];
        return user;
    };


    this.authorize = function(username, password)
    {
        var user2bind = users[  username];
        var passwordHash = user2bind.password;
        return scrypt.verifyHashSync(passwordHash, password);

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
        saveConfigFile("users.json", users);
    };

    this.setPassword = function(user_id, password_plain)
    {
        users[user_id]["password"] = scrypt.passwordHashSync(password_plain, 0.1);
        users[user_id]["password_set"] = true;
        saveConfigFile("users.json", users);
    };

    this.isInitialized = function()
    {
        return !!users.length;
    }

};

module.exports = {
    createUserStore: function(options)
    {
      return new ConfigFileUserStore(options);
    },
    ConfigFileUserStore: ConfigFileUserStore

};