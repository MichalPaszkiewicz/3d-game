module App.Display {
    export enum crossHairType{
        STANDARD,
        SNIPER,
        SNIPER_ZOOM
    };

    var crossHairs = [
        {
            name: "standard", draw: function () {
                ctx.strokeStyle = "rgba(0,0,255,0.8)";
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 - 20, canvas.height / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 + 10, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 + 20, canvas.height / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
                ctx.lineTo(canvas.width / 2, canvas.height / 2 - 20);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2 + 10);
                ctx.lineTo(canvas.width / 2, canvas.height / 2 + 20);
                ctx.stroke();
                ctx.strokeStyle = "black";
            }
        },
        {
            name: "sniper", draw: function () {
                ctx.strokeStyle = "rgba(0,0,255,0.8)";
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 50, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 + 50, canvas.height / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2 - 50);
                ctx.lineTo(canvas.width / 2, canvas.height / 2 + 50);
                ctx.stroke();
                ctx.strokeStyle = "black";
            }
        },
        {
            name: "sniper_zoom", draw: function () {
                var scopeR = 300;
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = "xor";
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, scopeR, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - scopeR, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 + scopeR, canvas.height / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2 - scopeR);
                ctx.lineTo(canvas.width / 2, canvas.height / 2 + scopeR);
                ctx.stroke();
            }
        }
    ];

    export var currentCrossHair = crossHairType.STANDARD;

    export function drawCrossHair() {
        crossHairs[currentCrossHair].draw();
    }
}