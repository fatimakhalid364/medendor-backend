const {roles: {rolesArray}} = require('constants');

const validateSignup = (req, res, next) => {
    const { body, query: { role } } = req;
    console.log('Validating signup request:', body, role);
    if (!role || !rolesArray.includes(role)) {
        return res.status(400).json({ message: 'Invalid or missing role' });
    }

    const { name, email, password } = body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    next(); 
}

const validateCode = (req, res, next) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (typeof code !== 'string' || code.length !== 6) {
        return res.status(400).json({ message: 'Verification code must be a 6-digit string.' });
    }

    next();
};

module.exports = {
    validateSignup,
    validateCode
};