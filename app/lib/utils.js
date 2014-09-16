/**
 * Utilities
 * Springload - 2014
 *
 **/

crypto = require("crypto")
var Hashids = require("hashids");

module.exports = {
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    encryptPassword: function (password, salt) {
        if (!password) return ''
        var encrypred
        try {
            encrypred = crypto.createHmac('sha1', salt).update(password).digest('hex')
            return encrypred
        } catch (err) {
            return ''
        }
    },
    authenticate: function (plainText, user) {
        return this.encryptPassword(plainText, user.salt) === user.password;
    },
    slugify: function(str) {
        var from  = "ąàāáäâãåæćęèeēéëêìíïîłńòoōóöôõøśùúüûñçżź",
          to    = "aaaaaaaaaceeeeeeiiiilnooooooosuuuunczz",
          regex = new RegExp('[' + from.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + ']', 'g');

        if (str == null) return '';



        str = String(str).toLowerCase().replace(regex, function(c) {
        return to.charAt(from.indexOf(c)) || '-';
        });

        return str.replace(/[^\w\s-]/g, '').replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    },
    extend: function () {
        var hasOwnProperty = Object.hasOwnProperty;
        var object = Object.create(this);
        var length = arguments.length;
        var index = length;

        while (index) {
            var extension = arguments[length - (index--)];

            for (var property in extension)
                if (property !== "clones" &&
                    hasOwnProperty.call(extension, property) ||
                    typeof object[property] === "undefined")
                        object[property] = extension[property];

            if (hasOwnProperty.call(extension, "clones"))
                extension.clones.unshift(object);
            else extension.clones = [object];
        }

        return object;
    },
    hashId: function(app, id) {
        var len = app.config.app.hashIdLength || 12;
        var H = new Hashids(app.config.app.secret, len);
        return H.encrypt(id);
    },
    unHashId: function(app, hash) {
        var len = app.config.app.hashIdLength || 12;
        var H = new Hashids(app.config.app.secret, len);
        return H.decrypt(hash)[0];
    }
};