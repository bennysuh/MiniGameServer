var net = require('net');
var config = require('../lib/config');
var Client = require('../lib/clients').Client;
var Command = require('../lib/code').Command;

var socket = new net.Socket();

var loginObj = {
    'name' : 'abc',
};

var updateObj = [{
    'uid' : 1,
    'pawnid' : 0,
    'name' : 'abc',
    'growth' : 1.0,
    'type' : 0,
    'state' : -1,
    'x' : 1.0,
    'y' : 2.0,
    'isDead' : false
}];

socket.connect(config.addr.port, config.addr.ip, function() {
    socket.write(Client.toBuffer(Command.LOGIN, JSON.stringify(loginObj)));
    socket.write(Client.toBuffer(Command.UPDATE, JSON.stringify(updateObj)));
});

socket.on('data', function(data) {
    console.log(data.toString());
});
