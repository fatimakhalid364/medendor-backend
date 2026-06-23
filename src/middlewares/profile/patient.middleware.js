const {mimeTypesArray} = require('constants/enum');

const validateIsPatient = (req, res, next) => {
    const user = req.user; 
    console.log('Validating if user is patient:', user);

    if (!user || user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Only patients can create, update or get patient details.' });
    }

    next();
}


const validateBasicPatientInfo = (req, res, next) => {
    const {
        gender,
        country,
        city,
        age,
        languagesSpoken,
    } = req.body;

    const profilePicture = req.file;

    if (!gender || !country || !city || !age || !languagesSpoken?.length || !profilePicture) {
        return res.status(400).json({ message: 'Missing required basic info for patient.' });
    }

    if (!mimeTypesArray.includes(profilePicture.mimetype)) {
        return res.status(400).json({ 
            message: 'Invalid file type. Only JPEG, PNG, JPG, AVIF, and WEBP images are allowed.' 
        });
    }

    next();
};

const validateHealthInterests = (req, res, next) => {
    const {
        primaryConcerns
    } = req.body;

    if (!primaryConcerns) {
        return res.status(400).json({ message: 'Missing required health interests for patient.' });
    }

    next();
};

module.exports = {validateIsPatient, validateBasicPatientInfo, validateHealthInterests}