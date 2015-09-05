var net = require('net');
var config = require('./lib/config');
var Client = require('./lib/clients').Client;
var Clients = require('./lib/clients').Clients;
var Command = require('./lib/code').Command;
var Error = require('./lib/code').Error;
var Pawns = require('./lib/pawns').Pawns;
var sceneSize = config.sceneSize;

var logger = require('log4js').getLogger('minigame');
logger.setLevel(config.logLevel);

var pawns = new Pawns();
var clients = new Clients();

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

var server = net.createServer(function(socket) {
    var client = new Client(socket);
    logger.info('client ' + client.addr + ' connected');

    client.on('request', function(cmd, body) {
        logger.info('request from client ' + client.addr +
                ' cmd: ' + cmd + ', body: ' + JSON.stringify(body));
        if (cmd == Command.LOGIN) {
            if (typeof body.name != 'undefined') {
                if (clients.hasName(body.name)) {
                    logger.info(client.addr + ' duplicate username detected: ' + body.name);
                    var duplicateError = {
                        'error' : Error.DUPLICATE_USERNAME
                    };
                    logger.trace(JSON.stringify(duplicateError));
                    client.sendResponse(
                            Client.toBuffer(cmd, JSON.stringify(duplicateError)));
                } else {
                    // new player successfully added
                    client.name = body.name;
                    client.isLogin = true;
                    clients.add(client);
                    logger.info(client.addr + ' successfully login, uid: ' + client.uid);

                    var loginSuccess = {
                        'error' : Error.OK,
                        'x'     : getRandom(sceneSize.horizonal.min, sceneSize.horizonal.max),
                        'y'     : getRandom(sceneSize.vertical.min, sceneSize.vertical.max),
                        'uid'   : client.uid
                    };
                    logger.trace(JSON.stringify(loginSuccess));
                    client.sendResponse(Client.toBuffer(cmd, JSON.stringify(loginSuccess)));
                }
            }
        } else if (cmd == Command.LOGOUT) {
            if (client.isLogin) {
                if (client.isLogin) {
                    pawns.orphanByUid(client.uid);
                    clients.remove(client);
                }
            } else {
                logger.error(client.addr + ' invalid logout before login');
            }
        } else if (cmd == Command.UPDATE) {
            if (client.isLogin) {
                if (Array.isArray(body)) {
                    if (body.length == 1) {
                        // pawn is not split
                        pawns.update(body[0]);
                    } else if (body.length > 1) {
                        // pawn is split
                        for (var jsonObj in body) {
                            pawns.update(jsonObj);
                        }
                    } else {
                        logger.error(client.addr + ' invalid update array size: ' +
                                body.length);
                    }
                } else {
                    logger.error(client.addr + ' invalid update detected: ' + body);
                }
            } else {
                logger.error(client.addr + ' invalid update before login');
            }
        } else if (cmd == Command.DEAD) {
            // all pawns of the player are dead
            if (client.isLogin) {
                clients.remove(client);
            } else {
                logger.error(client.addr + ' invalid dead before login');
            }
        } else {
            logger.error('unknown command code: ' + cmd + ' from client' + client.addr);
        }
    });

    client.on('close', function() {
        logger.info('client ' + client.addr + ' closed');
        if (client.isLogin) {
            pawns.orphanByUid(client.uid);
            clients.remove(client);
        }
    });

    client.on('error', function(err) {
        logger.error('close client ' + client.addr + ' due to error\n' + err.stack);
        if (client.isLogin) {
            pawns.orphanByUid(client.uid);
            clients.remove(client);
        }
    });
});

server.on('error', function(err) {
    logger.fatal('killing minigame server due to error\n' + err.stack);
    process.exit(1);
});

// start server
logger.info('starting minigame server at: ' +
        config.addr.ip + ':' + config.addr.port);
server.listen(config.addr.port, config.addr.ip);

// cron job
setInterval(function() {
    //logger.trace('broadcasting messages');
    var pawnsUpdate = pawns.toString();
    logger.trace(JSON.stringify(pawnsUpdate)); 
    clients.iter(function (client) {
        client.sendResponse(Client.toBuffer(Command.UPDATE, pawnsUpdate));
    });
}, config.broadcastInterval);

// signal handler
//process.on('SIGINT', function() {
    //logger.info('stopping minigame server');
    //server.close(function() {
        //process.exit(0);
    //});
//});
