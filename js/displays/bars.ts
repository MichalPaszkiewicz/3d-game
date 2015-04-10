function drawEnergyBar() {
    if (energy != null) {
        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.fillRect(canvas.width - 110, canvas.height - 20, energy, 10);
        ctx.strokeRect(canvas.width - 110, canvas.height - 20, 100, 10);
    }
}

function drawHealthBar() {
    if (health != null) {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width - 110, canvas.height - 35, health, 10);
        ctx.strokeRect(canvas.width - 110, canvas.height - 35, 100, 10);
    }
}