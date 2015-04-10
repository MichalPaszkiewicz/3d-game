var Logger : any = function () {
    var self = this;

    self.height = canvas.height;
    self.logs = [];
    self.log = function (text : string, colour?: string) {
        if (colour == null) {
            colour = "black";
        }
        self.logs.push({ text: text, colour: colour });
    }
    self.drawLog = function () {
        var cutoff = 0;
        if (10 * self.logs.length + 10 > self.height) {
            cutoff = 10 * self.logs.length + 10 - self.height;
        }
        for (var i = 0; i < self.logs.length; i++) {
            ctx.fillStyle = self.logs[i].colour;
            ctx.fillText(self.logs[i].text, 10, 10 * i + 10 - cutoff);
        }
    }
    self.clearLog = function () {
        self.logs = [];
    }

    return self;
}

var currentLog = new Logger();

function log(text : string, colour?: string) {
    currentLog.log(text, colour);
}