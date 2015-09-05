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
    logger.info(client.addr + ' client connected');

    client.on('request', function(cmd, body) {
        logger.info(client.addr + ' request from client ' + ' cmd: ' + cmd +
                ', body: ' + JSON.stringify(body));
        if (cmd == Command.LOGIN) {
            if (typeof body.name != 'undefined') {
                if (clients.hasName(body.name)) {
                    logger.info(client.addr + ' duplicate username detected: ' + body.name);
                    var duplicateError = JSON.stringify({
                        'error' : Error.DUPLICATE_USERNAME
                    });
                    logger.trace(client.addr + ' login response:')
                    logger.trace('cmd: ' + cmd + ', body length: ' +
                            duplicateError.length + ', body: ' + duplicateError);
                    client.sendResponse(Client.toBuffer(cmd, duplicateError));
                } else {
                    // new player successfully added
                    client.name = body.name;
                    client.isLogin = true;
                    clients.add(client);
                    logger.info(client.addr + ' successfully login, uid: ' + client.uid);

                    var loginSuccess = JSON.stringify({
                        'error' : Error.OK,
                        'x'     : getRandom(sceneSize.horizonal.min, sceneSize.horizonal.max),
                        'y'     : getRandom(sceneSize.vertical.min, sceneSize.vertical.max),
                        'uid'   : client.uid
                    });
                    logger.trace(client.addr + ' login response:')
                    logger.trace('cmd: ' + cmd + ', body length: ' +
                            loginSuccess.length + ', body: ' + loginSuccess);
                    client.sendResponse(Client.toBuffer(cmd, loginSuccess));
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
                    if (body.length >= 1) {
                        for (var idx in body) {
                            pawns.update(body[idx]);
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
            logger.error(client.addr + ' receive unknown command code: ' + cmd);
        }
    });

    client.on('close', function() {
        logger.info(client.addr + ' client closed');
        if (client.isLogin) {
            pawns.orphanByUid(client.uid);
            clients.remove(client);
        }
    });

    client.on('error', function(err) {
        logger.error(client.addr + 'close client due to error\n' + err.stack);
        if (client.isLogin) {
            pawns.orphanByUid(client.uid);
            clients.remove(client);
        }
    });
});

server.on('error', function(err) {
    logger.fatal('[server] killing minigame server due to error\n' + err.stack);
    process.exit(1);
});

// start server
logger.info('[server] starting minigame server at: ' +
        config.addr.ip + ':' + config.addr.port);
server.listen(config.addr.port, config.addr.ip);

// cron job
setInterval(function() {
    logger.trace('[server] broadcasting pawns information: ');
    var pawnsUpdate = pawns.toString();
    logger.trace('[server] cmd: ' + Command.UPDATE + ', body length: ' + pawnsUpdate.length +
            ', body: ' + pawnsUpdate);
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
