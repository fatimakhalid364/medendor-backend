const express = require('express');
const router = express.Router();
const {
        doctorProfileMiddlewares: 
        {
            validateIsDoctor, 
            validateBasicDoctorInfo,
            validateAvailabilityDetails, 
            validateCredentialDetails, 
            validateProfessionalDetails, 
            validateDoctorFinalTouches,
            validateCommunitiesArray
        },
        authMiddlewares: {authenticateSession}
    } = require('middlewares');
const multer = require('multer');
const { cloudinary: {storage} } = require('config');
const { 
    doctorProfileControllers: {
        handleAddBasicDoctorInfo,
        handleUpdateBasicDoctorInfo,
        handleAddProfessionalDetails,
        handleUpdateProfessionalDetails,
        handleAddCredentials,
        handleUpdateCredentials,
        handleAddAvailabilityDetails,
        handleUpdateAvailabilityDetails,
        handleAddJoinedCommunitiesArray,
        handleLeaveCommunities,
        handleAddFinalTouches,
        handleUpdateFinalTouches
    }} = require('controllers');

const {validateRequestFields} = require('middlewares/profile.middleware');

const upload = multer({ storage });

router.use(authenticateSession);
router.use(validateIsDoctor);

/*
|--------------------------------------------------------------------------
| Basic Doctor Info
|--------------------------------------------------------------------------
*/

router.post(
    '/basic-info',
    upload.single('profilePicture'),
    validateBasicDoctorInfo,
    handleAddBasicDoctorInfo
);

router.put(
    '/basic-info',
    upload.single('profilePicture'),
    handleUpdateBasicDoctorInfo
);

/*
|--------------------------------------------------------------------------
| Professional Details
|--------------------------------------------------------------------------
*/

router.post(
    '/professional-details',
    validateProfessionalDetails,
    handleAddProfessionalDetails
);

router.put(
    '/professional-details',
    validateRequestFields,
    handleUpdateProfessionalDetails
);

/*
|--------------------------------------------------------------------------
| Credentials
|--------------------------------------------------------------------------
*/

router.post(
    '/credentials',
    validateCredentials,
    handleAddCredentials
);

router.put(
    '/credentials',
    validateRequestFields,
    handleUpdateCredentials
);

/*
|--------------------------------------------------------------------------
| Availability
|--------------------------------------------------------------------------
*/

router.post(
    '/availability',
    validateAvailabilityDetails,
    handleAddAvailabilityDetails
);

router.put(
    '/availability',
    validateRequestFields,
    handleUpdateAvailabilityDetails
);

/*
|--------------------------------------------------------------------------
| Communities
|--------------------------------------------------------------------------
*/

router.post(
    '/communities',
    validateCommunitiesArray,
    handleAddJoinedCommunitiesArray
);

router.delete(
    '/communities',
    handleLeaveCommunities
);

/*
|--------------------------------------------------------------------------
| Final Touches
|--------------------------------------------------------------------------
*/

router.post(
    '/final-touches',
    validateDoctorFinalTouches,
    handleAddFinalTouches
);

router.put(
    '/final-touches',
    validateRequestFields,
    handleUpdateFinalTouches
);


module.exports = router;