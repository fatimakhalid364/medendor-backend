const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/', require('./symptomChecker.routes'));
router.use('/profile', require('./profile.routes'));

module.exports = router;


