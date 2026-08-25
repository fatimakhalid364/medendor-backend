const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashString = async (plainString) => {
    const hash = await bcrypt.hash(plainString, SALT_ROUNDS);
    return hash;
};

const compareString = async (plainString, hashedString) => {
    const match = await bcrypt.compare(plainString, hashedString);
    return match;
};

module.exports = {
    hashString,
    compareString,
};