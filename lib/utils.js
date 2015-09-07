function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

exports.getRandom = getRandom;
