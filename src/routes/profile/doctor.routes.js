const express = require('express');
const router = express.Router();
const {
        doctorProfileMiddlewares: {validateIsDoctor, validateBasicDoctorInfo},
        authMiddlewares: {authenticateSession}
    } = require('middlewares');
const multer = require('multer');
const { cloudinary: {storage} } = require('config');
const { doctorProfileControllers: {handleAddBasicDoctorInfo} } = require('controllers');

const upload = multer({ storage });

router.post(
    '/doctor',
    authenticateSession, 
    validateIsDoctor,
    upload.single('profilePicture'),
    validateBasicDoctorInfo,
    handleAddBasicDoctorInfo
);


module.exports = router;