module App.Display {
    var Logger: any = function () {
        var self = this;

        self.height = canvas.height;
        self.logs = [];
        self.log = function (text: string, colour?: string) {
            if (colour == null) {
                colour = "black";
            }
            if (self.logs.length > 0 && self.logs[self.logs.length - 1].text == text) {
                self.logs[self.logs.length - 1].count++;
            }
            else {
                self.logs.push({ text: text, colour: colour, count: 0 });
            }
        };
        self.drawLog = function () {
            var cutoff = 0;
            if (10 * self.logs.length + 10 > self.height) {
                cutoff = 10 * self.logs.length + 10 - self.height;
            }
            for (var i = 0; i < self.logs.length; i++) {
                ctx.fillStyle = self.logs[i].colour;
                var displayText = self.logs[i].text;
                if (self.logs[i].count > 0) {
                    displayText += " (" + self.logs[i].count + ")";
                }
                ctx.fillText(displayText, 10, 10 * i + 10 - cutoff);
            }
        };
        self.clearLog = function () {
            self.logs = [];
        };

        return self;
    };

    export var currentLog = new Logger();

    export function log(text: string, colour?: string) {
        currentLog.log(text, colour);
        canvasNeedsUpdate = true;
    }
}