var express = require('express');
var app = express();
var http = require('http').Server(app);

require('./socket_server').listen(http);

http.listen(8000, function(){
	console.log('listening on *:8000');
});