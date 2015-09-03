var config = require('./config');
var sceneSize = config.sceneSize;

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

var Pawn = function(uid, name) {
    var self = this;
    self.uid = uid;
    self.name = name;
    self.x = 0.0;
    self.y = 0.0; 
    self.growth = 0.0;
    self.isDead = false;
};

Pawn.prototype.init = function() {
    var self = this;
    self.x = getRandom(sceneSize.horizonal.min, sceneSize.horizonal.max);
    self.y = getRandom(sceneSize.vertical.min, sceneSize.vertical.max);
    self.growth = Math.random() * config.maxPawnInitGrowth;
    self.isDead = false;
};

var Pawns = function() {
    var self = this;
    self.pawns = {};
    self.maxUid = 0;
};

Pawns.prototype.add = function(name) {
    var self = this;
    self.pawns[name] = new Pawn(++self.maxUid, name);
    self.pawns[name].init();
};

Pawns.prototype.remove = function(name) {
    var self = this;
    delete self.pawns[name];
};

Pawns.prototype.has = function(name) {
    var self = this;
    return self.pawns.hasOwnProperty(name);
};

Pawns.prototype.get = function(name) {
    var self = this;
    return self.pawns[name];
}

Pawns.prototype.update = function(name, newPawn) {
    var self = this;
    if (self.has(name)) {
        self.pawns[name] = newPawn;
    }
};

Pawns.prototype.setDead = function(name) {
    var self = this;
    if (self.has(name)) {
        self.get(name).isDead = true;
    }
};

Pawns.prototype.reborn = function(name) {
    var self = this;
    if (self.has(name)) {
        self.get(name).init();
    }
};

Pawns.prototype.iter = function(func) {
    var self = this;
    for (var name in self.pawns) {
        if (self.has(name)) {
            func(self.get(name));
        }
    }
};

exports.Pawns = Pawns;
