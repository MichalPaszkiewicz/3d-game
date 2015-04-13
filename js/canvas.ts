var canvas = <HTMLCanvasElement> document.getElementById("my-canvas");

canvas.width = canvas.parentElement.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;

var ctx = canvas.getContext("2d"); 

//canvas is only redrawn when this is set to true.
var canvasNeedsUpdate = false;