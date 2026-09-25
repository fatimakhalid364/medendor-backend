const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/', require('./symptomChecker.routes'));
router.use('/profile/doctor', require('./profile/doctor.routes'));
router.use('/profile/patient', require('./profile/patient.routes'));

module.exports = router;


