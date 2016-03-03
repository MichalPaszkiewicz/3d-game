var socket =io();
socket.on('connected',function(){
	init();
});

function init(){
	console.log('init');	
}