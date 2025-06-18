const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
};

const comparePassword = async (plainPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
};

module.exports = {
    hashPassword,
    comparePassword,
};