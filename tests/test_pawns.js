var Pawns = require('../lib/pawns').Pawns;

var pawns = new Pawns();

function printPawns(pawn) {
    console.log(JSON.stringify(pawn));
}

pawns.add('jack');
pawns.iter(printPawns);
pawns.add('rose');
pawns.add('tom');
pawns.iter(printPawns);

console.log(pawns.has('jack'));
console.log(pawns.has('jerry'));

console.log(JSON.stringify(pawns.get('rose')));

pawns.remove('jack');
pawns.iter(printPawns);
