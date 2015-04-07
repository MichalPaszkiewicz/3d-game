// message.js
// ==========
module.exports = {
    Message: function (type, message) {
        
        var self = {};
        self.content = {
            type: type,
            message: message
        };

        self.asString = function () {
            return JSON.stringify(self.content);
        }

        return self;
    }
}