var net = require('net');
var config = require('./lib/config');
var Client = require('./lib/clients').Client;
var Clients = require('./lib/clients').Clients;
var Command = require('./lib/code').Command;
var Error = require('./lib/code').Error;
var Pawns = require('./lib/pawns').Pawns;
var logger = require('log4js').getLogger('minigame');

logger.setLevel(config.logLevel);

var pawns = new Pawns();
var clients = new Clients();

var server = net.createServer(function(socket) {
    var client = new Client(socket);
    logger.info('client ' + client.addr + ' connected');

    client.on('request', function(cmd, body) {
        logger.info('request from client ' + client.addr +
                ' cmd: ' + cmd + ', body: ' + JSON.stringify(body));
        if (cmd == Command.LOGIN) {
            if (typeof body.name != 'undefined') {
                if (pawns.has(body.name)) {
                    logger.info(client.addr + ' duplicate username detected: ' + body.name);
                    var duplicateError = {
                        'error' : Error.DUPLICATE_USERNAME
                    };
                    client.sendResponse(
                            Client.toBuffer(cmd, JSON.stringify(duplicateError)));
                } else {
                    // new player successfully added
                    pawns.add(body.name);
                    client.name = body.name;
                    client.isLogin = true;
                    clients.add(client);
                    var pawn = pawns.get(body.name);
                    pawn['error'] = Error.OK;
                    client.sendResponse(Client.toBuffer(cmd, JSON.stringify(pawn)));
                }
            }
        } else if (cmd == Command.LOGOUT) {
            if (client.isLogin) {
                client.isLogin = false;
                pawns.remove(client.name);
                clients.remove(client.id);
            } else {
                logger.error(client.addr + ' invalid logout before login');
            }
        } else if (cmd == Command.UPDATE) {
            if (client.isLogin) {
                pawns.update(body.name, body);
            } else {
                logger.error(client.addr + ' invalid update before login');
            }
        } else if (cmd == Command.DEAD) {
            if (client.isLogin) {
                pawns.setDead(client.name);
                clients.remove(client.id);
            } else {
                logger.error(client.addr + ' invalid dead before login');
            }
        } else if (cmd == Command.REBORN) {
            if (client.isLogin) {
                pawns.reborn(client.name);
                clients.add(client);
            } else {
                logger.error(client.addr + ' invalid reborn before login');
            }
        } else {
            logger.error('unknown command code: ' + cmd + ' from client' + client.addr);
        }
    });

    client.on('close', function() {
        logger.info('client [' + client.addr + '] closed');
        pawns.remove(client.name);
        clients.remove(client.id);
    });

    client.on('error', function(err) {
        logger.error('close client [' + client.addr + '] due to error\n' + err.stack);
        pawns.remove(client.name);
        clients.remove(client.id);
    });
});

server.on('error', function(err) {
    logger.fatal('killing minigame server due to error\n' + err.stack);
    process.exit(1);
});

server.on('close', function() {
    logger.info('stopping minigame server');
});

// start server
logger.info('starting minigame server at: ' +
        config.addr.ip + ':' + config.addr.port);
server.listen(config.addr.port, config.addr.ip);

// cron job
setInterval(function() {
    logger.trace('broadcasting messages');
    clients.iter(function (client) {
        pawns.iter(function (pawn) {
            client.sendResponse(Client.toBuffer(Command.UPDATE, JSON.stringify(pawn)));
        });
    });
}, config.broadcastInterval);

// signal handler
process.on('SIGINT', function() {
    server.close(function() {
        process.exit(0);
    });
});
