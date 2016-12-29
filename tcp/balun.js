/**
 * NAME 2016/12/29
 * DATE 2016/12/29
 * AUTHOR shangxinbo
 */
exports.shiftOne = function(){
    SERVER_CONF.list.shift();
};

exports.getServer = function(){
    return SERVER_CONF.list[0];
};


