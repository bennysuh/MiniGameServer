var events = require('events');
var Buffers = require('buffers');

var logger = require('log4js').getLogger('minigame');

var commandCodeSize = 1;
var bodyLengthSize = 2;
var headerSize = commandCodeSize + bodyLengthSize;

// max buffer size per client allowed to used is up to 1M Bytes
var maxBufferSize = 1024 * 1024;

var Client = function(socket) {
    var self = this;
    self.uid = 0;
    self.name = '';
    self.isLogin = false;
    self.socket = socket;
    self.addr = '[' + socket.remoteAddress + ':' + socket.remotePort + ']';
    self.buffer = new Buffers();

    self.socket.on('data', function(chunk) {
        logger.trace('receive data from ' + self.addr + ' ' + chunk.toString('hex'));
        self.buffer.push(chunk);
        if (self.buffer.length > maxBufferSize) {
            self.emit('oom');
        }
        while (self.buffer.length >= headerSize) {
            logger.trace('buffer length: ' + self.buffer.length);
            var header = self.buffer.slice(0, headerSize);
            var offset = 0;
            var cmd = header.readUInt8(offset);
            offset += commandCodeSize;
            var bodyLength = header.readUInt16BE(offset);
            logger.trace('body length: ' + bodyLength);
            offset += bodyLengthSize;
            if (headerSize + bodyLength <= self.buffer.length) {
                var body = {};
                if (bodyLength > 0) {
                    var bodyStr = self.buffer.slice(offset, offset + bodyLength);
                    try {
                        body = JSON.parse(bodyStr);
                    } catch (e) {
                        logger.error(self.addr + ' invalid json: ' + bodyStr);
                    }
                }
                offset += bodyLength;
                self.buffer.splice(0, offset);
                self.emit('request', cmd, body);
            } else {
                // incomplete body
                break;
            }
        }
    });

    self.socket.on('close', function() {
        self.emit('close');
    });

    self.socket.on('error', function(err) {
        self.emit('error', err);
    });
};

Client.prototype.__proto__ = events.EventEmitter.prototype;

Client.toBuffer = function(cmd, body) {
    var buffer = new Buffer(headerSize + body.length);
    var offset = 0;
    buffer.writeUInt8(cmd, offset);
    offset += commandCodeSize;
    buffer.writeUInt16BE(body.length, offset);
    offset += bodyLengthSize;
    buffer.write(body, offset);
    offset += body.length;
    return buffer;
};

Client.prototype.sendResponse = function(data) {
    var self = this;
    self.socket.write(data);
};

Client.CommandCodeSize = commandCodeSize;
Client.BodyLengthSize = bodyLengthSize;

var Clients = function() {
    var self = this;
    self.clients = {};
    self.names = {};
    self.maxUid = 0;
};

Clients.prototype.add = function(client) {
    var self = this;
    ++self.maxUid;
    self.clients[self.maxUid] = client;
    self.names[client.name] = true;
    client.uid = self.maxUid;
};

Clients.prototype.remove = function(client) {
    var self = this;
    self.removeName(client.name);
    delete self.clients[client.uid];
};

Clients.prototype.hasName = function(name) {
    var self = this;
    logger.trace('names table: ' + JSON.stringify(self.names));
    // empty name is preserved for server
    if (name == '') return true;
    return self.names.hasOwnProperty(name);
};

Clients.prototype.removeName = function(name) {
    var self = this;
    delete self.names[name];
};

Clients.prototype.has = function(uid) {
    var self = this;
    return self.clients.hasOwnProperty(uid);
};

Clients.prototype.get = function(uid) {
    var self = this;
    return self.clients[uid];
}

Clients.prototype.iter = function(func) {
    var self = this;
    for (var uid in self.clients) {
        if (self.has(uid)) {
            func(self.get(uid));
        }
    }
};

exports.Client = Client;
exports.Clients = Clients;
