module App {
    export var Message = function (type: string, message: string | Object) {

        var self = {
            content: {
                type: type,
                message: message,
                from: null
            },
            asString: function () {
                return JSON.stringify(self.content);
            }
        };

        return self;
    }
}