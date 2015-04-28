// message.js
// ==========
module.exports = {
    Message: function (type, message, from) {
        
        var self = {};
        self.content = {
            type: type,
            message: message,
            from : from
        };

        self.asString = function () {
            return JSON.stringify(self.content);
        }

        return self;
    }
}