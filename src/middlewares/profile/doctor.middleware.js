const {enum: {workPlaceStatusArray, mimeTypesArray, openToArray, notifKeysArray, visibilityKeysArray, communitiesArray}} = require('constants');


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
        gender,
        country,
        city,
        age,
        languagesSpoken,
    } = req.body;

    const profilePicture = req.file;

    if (!gender || !country || !city || !age || !languagesSpoken?.length || !profilePicture) {
        return res.status(400).json({ message: 'Missing required basic info for doctor.' });
    }

    if (!mimeTypesArray.includes(profilePicture.mimetype)) {
        return res.status(400).json({ 
            message: 'Invalid file type. Only JPEG, PNG, JPG, AVIF, and WEBP images are allowed.' 
        });
    }

    next();
};


const validateAvailabilityDetails = (req, res, next) => {
    const availability = req.body;

    if (!availability || typeof availability !== 'object') {
        return res.status(400).json({ error: 'Availability information is required for doctors.' });
    }

    const {
        workplaces,
        availableForOnlineConsultation,
        acceptingNewPatients,
        consultationFee,
        appointmentTimeSlots
    } = availability;

    // Validate workplaces array
    if (!workplaces || (!Array.isArray(workplaces)) || workplaces.length == 0 || workplaces.length > 5 || (!workplaces.every(place => {
        return (
        place &&
        typeof place.name === 'string' &&
        place.name.trim() &&
        typeof place.location === 'string' &&
        place.location.trim()
        );
    }))) {
        return res.status(400).json({
        error: '1 - 5 workplaces are required. Each workplace must include a valid name, and location from the allowed list.'
        });
    }

    if (!consultationFee ||
        typeof consultationFee !== 'number' || consultationFee < 0) {
        return res.status(400).json({
        error: 'consultationFee is required and must be a non-negative number.'
        });
    }

    if (
        !appointmentTimeSlots ||
        !Array.isArray(appointmentTimeSlots) || appointmentTimeSlots.length === 0 || appointmentTimeSlots.length > 5 ||
        !appointmentTimeSlots.every(slot => typeof slot === 'string')) {
        return res.status(400).json({
        error: ' 1 - 5 appointment slots are required. AppointmentTimeSlots must be an array of strings.'
        });
    }


    if (
        availableForOnlineConsultation == undefined ||
        typeof availableForOnlineConsultation !== 'boolean'
    ) {
        return res.status(400).json({
        error: 'availableForOnlineConsultation must be a boolean value.'
        });
    }


    if (
        acceptingNewPatients == undefined ||
        typeof acceptingNewPatients !== 'boolean'
    ) {
        return res.status(400).json({
        error: 'acceptingNewPatients must be a boolean value.'
        });
    }
    
    next();
};


const validateCredentialDetails = (req, res, next) => {
    const credentials = req.body;
    if (!credentials || typeof credentials !== 'object') {
        return res.status(400).json({ error: 'Credentials are required for doctors.' });
    }

    const { 
            medicalLicenseNumber, 
            education, 
            issuingAuthority, 
            licenseCertificateUrl, 
            certifications
        } = credentials;

    if (
        !medicalLicenseNumber ||
        typeof medicalLicenseNumber !== 'string' ||
        !medicalLicenseNumber.trim()
    ) {
        return res.status(400).json({ error: 'Medical license number is required and must be a non-empty string.' });
    }

    if (!issuingAuthority || typeof issuingAuthority !== 'string' || !issuingAuthority.trim()) {
        return res.status(400).json({ error: 'Issuing authority is required and must be a non-empty string.' });
    }

    if (!education || !Array.isArray(education) || education.length === 0 || education.length > 5) {
        return res.status(400).json({ error: '1 -5 degrees are required. The data must be an array of objects.' });
    }

    if (certifications && (!Array.isArray(certifications) || certifications.length === 0 || certifications.length > 5 || !certifications.every(cert => typeof cert === 'string'))) {
        return res.status(400).json({ error: '1 - 5 certifications are allowed. Certifications must be an array, cannot be empty and each entry must be a string.' });
    }

    if (licenseCertificateUrl && typeof licenseCertificateUrl !== 'string') {
        return res.status(400).json({ error: 'License certificate URL must be a string.' });
    }

    const invalidEducationEntry = education.find(entry => {
        if (
            (!entry.degree || typeof entry.degree !== 'string' || !entry.degree.trim()) ||
            (!entry.institute || typeof entry.institute !== 'string' || !entry.institute.trim()) ||
            (!entry.country || typeof entry.country !== 'string' || !entry.country.trim()) ||
            (!entry.startYear || typeof entry.startYear !== 'number' || entry.startYear <= 0) || 
            (entry.endYear && (typeof entry.endYear !== 'number' || entry.endYear < entry.startYear)) ||
            (entry.currentlyStudying !== undefined && typeof entry.currentlyStudying !== 'boolean')
        ) {
            return true;
        }

        return false;
        });

        if (invalidEducationEntry) {
        return res.status(400).json({
            error: 'Each education entry must include valid degree, institute, country, and a valid startYear. Optional fields like endYear must be properly typed if present.'
        });
        }

    next();
};


const validateProfessionalDetails = (req, res, next) => {
    const professionalDetails = req.body;
    if (!professionalDetails || typeof professionalDetails !== 'object') {
        return res.status(400).json({ error: 'Professional details are required for doctors.' });
    }

    const { specialty, experience, subSpecialty, about } = professionalDetails;

    if (!specialty || specialty.trim() === '') {
        return res.status(400).json({ error: 'Specialty is required for doctors.' });
    }

    if (!experience || !Array.isArray(experience) || experience.length === 0 || experience.length > 5) {
        return res.status(400).json({ error: '1 -5 experiences are required. Data must be an array of objects.' });
    }

    if (subSpecialty && typeof subSpecialty !== 'string') {
        return res.status(400).json({ error: 'Sub-specialty must be a string'})
    }

    if (about && typeof about !== 'string') {
        return res.status(400).json({ error: 'About section must be a string.' });
    }

    for (const exp of experience) {
        if (
        !exp.organization ||
        !exp.position ||
        !exp.startDate
        ) {
        return res.status(400).json({
            error: 'Each experience entry must include organization, position, and startDate.'
        });
        }
    }

    next();
}



const validateDoctorFinalTouches = (req, res, next) => {
    const finalTouches = req.body;

    if (!finalTouches || typeof finalTouches !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid finalTouches object.' });
    }

    const {
        openTo,
        notificationPreferences,
        visibilitySettings
    } = finalTouches;


    if (openTo) {
        if (typeof openTo !== 'object') {
            return res.status(400).json({ error: 'Invalid openTo format. Must be an object.' });
        }

        for (let key of Object.keys(openTo)) {
            if (!openToArray.includes(key) || typeof openTo[key] !== 'boolean') {
                return res.status(400).json({ error: `Invalid openTo.${key} value.` });
            }
        }
    }


    if (notificationPreferences) {
        if (typeof notificationPreferences !== 'object') {
            return res.status(400).json({ error: 'Invalid notificationPreferences format. Must be an object.' });
        }

        for (let key of Object.keys(notificationPreferences)) {
            if (!notifKeysArray.includes(key) || typeof notificationPreferences[key] !== 'boolean') {
                return res.status(400).json({ error: `Invalid notificationPreferences.${key} value.` });
            }
        }
    }

    if (visibilitySettings) {
        if (typeof visibilitySettings !== 'object') {
            return res.status(400).json({ error: 'Invalid visibilitySettings format. Must be an object.' });
        }

        for (let key of Object.keys(visibilitySettings)) {
            if (!visibilityKeysArray.includes(key) || typeof visibilitySettings[key] !== 'boolean') {
                return res.status(400).json({ error: `Invalid visibilitySettings.${key} value.` });
            }
        }
    }


    next();
};

const validateCommunitiesArray = (req, res, next) => {
    const communities = req.body;
    if (!communities || !Array.isArray(communities) || communities.length === 0) {
        return res.status(400).json({ error: 'At least one community is required.' });
    }
    if ((!communities.every(comm => typeof comm === 'string')) || (!communities.every(comm => communitiesArray.includes(comm)))) {
        return res.status(400).json({ error: 'Invalid community name.' });
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
