var config = require('./config');
var utils = require('./utils');
var PlayerType = require('./code').PlayerType;
var sceneSize = config.sceneSize;

var Pawn = function() {
    var self = this;
    self.uid = 0;
    self.pawnid = 0;
    self.name = '';
    self.growth = 0.0;
    self.type = PlayerType.NONE;
    self.state = -1;
    self.x = 0.0;
    self.y = 0.0;
    self.isDead = false;
};

var pow2_32 = Math.pow(2, 32);

function hash(uid, pawnid) {
    return uid * pow2_32 + pawnid;
}

Pawn.prototype.hash = function() {
    var self = this;
    return hash(self.uid, self.pawnid);
};

Pawn.prototype.turnIntoNPC = function() {
    var self = this;
    self.name = '';
    self.type = PlayerType.NPC;
};

var Pawns = function() {
    var self = this;
    self.pawns = {};
};

Pawns.prototype.update = function(jsonObj) {
    var self = this;
    var hashcode = hash(jsonObj.uid, jsonObj.pawnid);
    if (!self.has(hashcode)) {
        // pawn not exist, create a new one
        self.pawns[hashcode] = new Pawn();
    }

    var pawn = self.pawns[hashcode];
    // update properties from json object to pawn object
    for (var prop in jsonObj) {
        pawn[prop] = jsonObj[prop];
    }

    if (pawn.type == PlayerType.NPC) {
        // ate by other player
        if (pawn.isDead) {
            self.remove(pawn);
        }
    }
};

Pawns.prototype.remove = function(pawn) {
    var self = this;
    delete self.pawns[pawn.hash()];
};

Pawns.prototype.has = function(hashcode) {
    var self = this;
    return self.pawns.hasOwnProperty(hashcode);
};

Pawns.prototype.get = function(hashcode) {
    var self = this;
    return self.pawns[hashcode];
};

Pawns.prototype.iter = function(func) {
    var self = this;
    for (var hashcode in self.pawns) {
        if (self.has(hashcode)) {
            func(self.get(hashcode));
        }
    }
};

Pawns.prototype.orphanByUid = function(uid) {
    var self = this;
    self.iter(function(pawn) {
        if (pawn.uid == uid) {
            pawn.turnIntoNPC();
        }
    });
};

Pawns.prototype.toString = function() {
    var self = this;
    var pawnsArray = [];
    self.iter(function(pawn) {
        pawnsArray.push(pawn);
    });
    return JSON.stringify(pawnsArray);
};

Pawns.prototype.generateNPCs = function() {
    var self = this;
    // uid 0 is preserved for server
    var uid = 0;
    for (var pawnid = 0; pawnid < config.generatedNPCNumber; ++pawnid) {
        var pawn = new Pawn();
        pawn.uid = uid;
        pawn.pawnid = pawnid;
        pawn.growth = Math.random() * config.maxGeneratedNPCGrowth;
        pawn.x = utils.getRandom(sceneSize.horizonal.min, sceneSize.horizonal.max);
        pawn.y = utils.getRandom(sceneSize.vertical.min, sceneSize.vertical.max);
        pawn.turnIntoNPC();
        self.pawns[pawn.hash()] = pawn;
    }
};

exports.Pawns = Pawns;
