const {enum: {workPlaceStatusArray, mimeTypesArray, openToArray}} = require('constants');


const validateIsDoctor = (req, res, next) => {
    const user = req.user; 
    console.log('Validating if user is doctor:', user);

    if (!user || user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Only doctors can create, update or get doctor details.' });
    }

    next();
}

const validateBasicDoctorInfo = (req, res, next) => {
    const {
       dateOfBirth,
        languagesSpoken,
    } = req.body;

    const profilePicture = req.file;

    if (!languagesSpoken?.length) {
        return res.status(400).json({ message: 'Missing required basic info for doctor.' });
    }

    if (age < 25){
        return res.status(400).json({ message: 'A doctor should either be 25 years or older.' });
    }

    if (profilePicture && !mimeTypesArray.includes(profilePicture.mimetype)) {
        return res.status(400).json({ 
            message: 'Invalid file type. Only JPEG, PNG, JPG, AVIF, and WEBP images are allowed.' 
        });
    }

    next();
};


const validateAvailabilityDetails = (req, res, next) => {
    const availability = req.body;

    if (!availability) {
        return res.status(400).json({ error: 'Missing entire availability info.' });
    }

    const {
        workplaces,
        availableForOnlineConsultation
    } = availability;

    if(
        availability.availableForOnlineConsultation === false &&
        availability.workplaces.length === 0
    ){
        throw new Error(
            "At least one workplace is required for offline consultation."
        );
    }

    
    next();
};


const validateCredentialDetails = (req, res, next) => {
    const credentials = req.body;
    
    if (!credentials) {
        return res.status(400).json({ error: 'Missing entire credentials info.' });
    }

    next();
};


const validateProfessionalDetails = (req, res, next) => {
    const professionalDetails = req.body;

    if (!professionalDetails) {
        return res.status(400).json({ error: 'Missing entire info for professional details.' });
    }

    next();
}



const validateDoctorFinalTouches = (req, res, next) => {
    const finalTouches = req.body;

    if (!finalTouches) {
        return res.status(400).json({ error: 'Missing or invalid finalTouches object.' });
    }


    next();
};


const validateCommunitiesArray = (req, res, next) => {
    const communities = req.body;
    if (!communities) {
        return res.status(400).json({ error: 'At least one community is required.' });
    }
}


module.exports = {
    validateIsDoctor, 
    validateBasicDoctorInfo, 
    validateAvailabilityDetails, 
    validateCredentialDetails, 
    validateProfessionalDetails, 
    validateDoctorFinalTouches,
    validateCommunitiesArray
};
