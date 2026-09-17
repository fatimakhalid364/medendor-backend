const {workPlaceStatusArray, mimeTypesArray, openToArray} = require('constants/enum');
const AppError = require('utils/appError.utils');
const {communitiesArray, issuingAuthArray} = require('constants/enum');


const validateIsDoctor = (req, res, next) => {
    const user = req.user; 
    console.log('Validating if user is doctor:', user);

    if (!user || user.role !== 'doctor') {
        return next(
            new AppError(
                'Only doctors an access this route',
                403,
                'INVALID_ROLE'
            )
        );
    }

    next();
}

const validateBasicDoctorInfo = (req, res, next) => {
    const {
        gender,
        dateOfBirth,
        country,
        city,
        languagesSpoken
    } = req.body;

    const profilePicture = req.file;

    if (!languagesSpoken?.length || !profilePicture || !gender || !dateOfBirth || !country || !city) {
        return next(
            new AppError(
                'Required fields are missing',
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        );
    }

    // Convert dateOfBirth to a Date
    const birthDate = new Date(dateOfBirth);

    // Make sure the date is valid
    if (Number.isNaN(birthDate.getTime())) {
        return next(
            new AppError(
                'Invalid date of birth.',
                400,
                'INVALID_DATE_OF_BIRTH'
            )
        );
    }

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (
            today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate()
        );

    if (!hasHadBirthdayThisYear) {
        age--;
    }

    if (age < 25) {
        return next(
            new AppError(
                'A doctor should be 25 years or older.',
                400,
                'INVALID_AGE'
            )
        );
    }

    if (!mimeTypesArray.includes(profilePicture.mimetype)) {
        return next(
            new AppError(
                'Invalid mime type. Only JPEG, JPG, PNG, AVIF and WEBP are allowed.',
                400,
                'INVALID_MIME_TYPE'
            )
        );
    }

    next();
};


const validateAvailabilityDetails = (req, res, next) => {

    const {
        workplaces,
        appointmentTimeSlots,
        consultationFee,
        availableForOnlineConsultation
    } = req.body;

    if(
        !availableForOnlineConsultation &&
        !workplaces?.length
    ){
         return next(
            new AppError(
                'At least one workplace is required.',
                400,
                'MISSING_WORKPLACE'
            )
        );
    }

    if(
        !appointmentTimeSlots || !consultationFee
    ){
         return next(
            new AppError(
                'Required fields are missing',
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        );
    }

     if(
        appointmentTimeSlots?.length == 0
    ){
         return next(
            new AppError(
                'Please add appointment time slots',
                400,
                'MISSING_APPOINTMENT_TIME_SLOTS'
            )
        );
    }

    
    next();
};


const validateCredentialDetails = (req, res, next) => {
    const {
        medicalLicenseNumber,
        issuingAuthority,
        licenseCertificateUrl,
        education,
        certifications
    } = req.body

    if (!medicalLicenseNumber ||
        !issuingAuthority ||
        !licenseCertificateUrl ||
        !education){
            return next(
                new AppError(
                    'Required fields are missing',
                    400,
                    'MISSING_REQUIRED_FIELDS'
                )
        );
    }

    if (!issuingAuthArray.includes(issuingAuthority)){
        return next(
                new AppError(
                    'Please enter a valid issuing authority',
                    400,
                    'INVALID_ISSUING_AUTHORITY'
                )
        );

    }

    if (!Array.isArray(education)) {
     return next(
                new AppError(
                    'Education must be an array.',
                    400,
                    'INVALID_EDUCATION_FORMAT'
                )
        );
    }

    if (education.length > 5){
        return next(
                new AppError(
                    'Maximum 5 education entries are allowed',
                    400,
                    'EXCEEDING_ENTRY_LIMIT'
                )
        );
    }

    if (certifications && certifications.length > 5){
        return next(
                new AppError(
                    'Maximum 5 certification entries are allowed',
                    400,
                    'EXCEEDING_ENTRY_LIMIT'
                )
        );
    }

    next();
};


const validateProfessionalDetails = (req, res, next) => {
    const {specialty, experience} = req.body;

    if (!specialty || !experience) {
         return next(
            new AppError(
                'Required fields are missing',
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        );
    }

    if (experience.length > 5){
         return next(
                new AppError(
                    'Maximum 5 experience entries are allowed',
                    400,
                    'EXCEEDING_ENTRY_LIMIT'
                )
        );
    }

    next();
}



const validateCommunitiesArray = (req, res, next) => {
    const communities = req.body;
    if (!Array.isArray(communities)) {
     return next(
                new AppError(
                    'Communities must be an array.',
                    400,
                    'INVALID_COMMUNITIES_FORMAT'
                )
        );
    }
    if (!communities?.length) {
        return next(
                new AppError(
                    'At least one community is required.',
                    400,
                    'MISSING_COMMUNITY'
                )
        );
    }

    if (!communities.every(
        community => communitiesArray.includes(community)
    )){
         return next(
                new AppError(
                    'Please submit from the available communities only.',
                    400,
                    'INVALID_COMMUNITY'
                )
        );
    }

    next();
}


module.exports = {
    validateIsDoctor, 
    validateBasicDoctorInfo, 
    validateAvailabilityDetails, 
    validateCredentialDetails, 
    validateProfessionalDetails, 
    validateCommunitiesArray
};
