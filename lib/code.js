var Command = {
    'LOGIN'  : 1,
    'LOGOUT' : 2,
    'UPDATE' : 3,
    'DEAD'   : 4,
};

var Error = {
    'OK'                 : 0,
    'DUPLICATE_USERNAME' : 1
};

var PlayerType = {
    'NONE' : -1,
    'NPC'  : 3
};

exports.Command = Command;
exports.Error = Error;
exports.PlayerType = PlayerType;
