var Command = {
    'LOGIN'  : 1,
    'LOGOUT' : 2,
    'UPDATE' : 3,
    'DEAD'   : 4,
    'REBORN' : 5
};

var Error = {
    'OK'                 : 0,
    'DUPLICATE_USERNAME' : 1
}

exports.Command = Command;
exports.Error = Error;
