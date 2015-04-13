function drawCrossHair() {
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
}