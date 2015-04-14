/// <reference path="../objects/me.ts" />
module App.Display {

    export function drawEnergyBar() {
        if (App.ME.energy != null) {
            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.fillRect(canvas.width - 110, canvas.height - 20, App.ME.energy, 10);
            ctx.strokeRect(canvas.width - 110, canvas.height - 20, 100, 10);
        }
    }

    export function drawHealthBar() {
        if (App.ME.health != null) {
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.fillRect(canvas.width - 110, canvas.height - 35, App.ME.health, 10);
            ctx.strokeRect(canvas.width - 110, canvas.height - 35, 100, 10);
        }
    }
}