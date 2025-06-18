const {authServices: {signup, verifyCode}} = require('services');

const handleSignup = async(req, res) => {
    try {
        console.log('Handling signup request:', req.body, req.query.role);
        const { body: data, query: {role} } = req;
        const result = await signup(data, role);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred during signup',
        });
    }
}

const handleVerifyCode = async(req, res) => {
    try {
        console.log('Handling verification code request:', req.body);
        const { email, code } = req.body;
        const result = await verifyCode(email, code);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred during verification',
        });
    }
}

module.exports = {handleSignup, handleVerifyCode}