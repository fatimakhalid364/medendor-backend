const express = require('express');
const router = express.Router();
const { profileControllers: {handleAddDoctorProfile} } = require('controllers');
const {authMiddlewares: {authenticateSession}, profileMiddlewares: {validateDoctorData, validateIsDoctor} } = require('middlewares');

router.post(
    '/doctor', 
    authenticateSession,
    validateIsDoctor,
    validateDoctorData, 
    handleAddDoctorProfile
);
router.get(
    '/doctor',
    authenticateSession,
    validateIsDoctor,
    handleAddDoctorProfile
);

module.exports = router;