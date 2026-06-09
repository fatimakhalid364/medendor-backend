const {env: {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, CSRF_TOKEN_SECRET}} = require('config');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateTokens = (userId, role) => {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessToken = jwt.sign(
        { sub: userId, accessJti, type: 'access', role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { sub: userId, refreshJti, type: 'refresh' },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    const csrfToken = crypto.randomBytes(32).toString("hex");


    return { accessToken, refreshToken, csrfToken, accessJti, refreshJti };
};

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

module.exports = {
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken
};
