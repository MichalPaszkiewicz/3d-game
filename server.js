var static = require('node-static');
var file = new static.Server('./UI');

//Define
var server = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
});
////////////////////////////////////////
var io =require('socket.io')(server);//
server.listen(9999);////////////////// -> Dont touch unless you know what you upto :P
/////////////////////////////////////
//vars
var users_count=0;


//start socket connection
io.on('connection',function(socket){
	socket.emit('connected');
	var user={};
	var response = {};
	users_count++;

	//disconnect
	socket.on('disconnect', function () {
		userCount--; //user -
	});
});
