var Pawns = require('../lib/pawns').Pawns;

var pawns = new Pawns();

function printPawns(pawn) {
    console.log(JSON.stringify(pawn));
}

pawns.update({'name' : 'jack', 'uid' : 1, 'pawnid' : 0, 'type' : 1});
pawns.iter(printPawns);
pawns.update({'name' : 'rose', 'uid' : 1, 'pawnid' : 1, 'type' : 0});
pawns.update({'name' : 'tom', 'uid' : 3, 'pawnid' : 0, 'type' : 2});
pawns.iter(printPawns);
pawns.orphanByUid(1);
pawns.iter(printPawns);

console.log(pawns.toString());
