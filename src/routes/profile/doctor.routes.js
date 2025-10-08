const express = require('express');
const router = express.Router();
const {doctorProfileMiddlewares: {validateIsDoctor, validateBasicDoctorInfo} } = require('middlewares');
const multer = require('multer');
const { cloudinary: {storage} } = require('config');

const upload = multer({ storage });

router.post(
    '/doctor', 
    validateIsDoctor,
    upload.single('profilePicture'),
    validateBasicDoctorInfo, 
);


module.exports = router;