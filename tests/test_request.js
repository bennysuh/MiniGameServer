var net = require('net');
var config = require('../lib/config');
var Client = require('../lib/clients').Client;

var socket = new net.Socket();

var cmd = 1;
var pawn = {
    'name' : 'abc',
};
var pawnStr = JSON.stringify(pawn);

socket.connect(config.addr.port, config.addr.ip, function() {
    socket.write(Client.toBuffer(cmd, pawnStr));
});

socket.on('data', function(data) {
    console.log(data.toString());
});
