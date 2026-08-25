const crypto = require('crypto');

const hashToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

const generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const generateRandomIdOrJti = () => {
    return crypto.randomUUID();
}

const generateRandomIntString = () => {
    return crypto
            .randomInt(100000, 1000000)
            .toString();
}

const safeCompare = (a, b) => {
    if (
        typeof a !== 'string' ||
        typeof b !== 'string'
    ) {
        return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    if (bufferA.length !== bufferB.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        bufferA,
        bufferB
    );
};

module.exports = {
    hashToken,
    generateRandomToken,
    generateRandomIdOrJti,
    safeCompare,
    generateRandomIntString
};