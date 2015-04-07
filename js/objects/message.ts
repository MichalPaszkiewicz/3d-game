var Message = function (type : string, message : string | Object) {

    var self = {
        content: {
            type: type,
            message: message
        },
        asString: function () {
            return JSON.stringify(self.content);
        }
    };

    return self;
}