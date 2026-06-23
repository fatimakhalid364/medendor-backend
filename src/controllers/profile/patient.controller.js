const {  
    addBasicPatientInfo,
    updateBasicPatientInfo,
    addHealthInterests,
    updateHealthInterests,
    addPrivacyPreferences,
    updatePrivacyPreferences,
    addPatientFinalTouches,
    updatePatientFinalTouches,
    addJoinedCommunitiesArray,
    leaveCommunities
} = require('services/patient.service');


const handleAddBasicPatientInfo = async(req, res) => {
    try {
        console.log('Handling addBasicPatientInfo request:', req.body, req.user);
        const userId = req.user.id;
        const textFields = req.body;
        const profilePictureUrl = req.file?.path;
        const basicPatientInfo = { ...textFields, profilePicture: profilePictureUrl };

        const result = await addBasicPatientInfo(userId, basicPatientInfo);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding basic patient info',
        });
    }
}


const handleUpdateBasicPatientInfo = async(req, res) => {
    try {
        console.log('Handling updateBasicPatientInfo request:', req.body, req.user);
        const userId = req.user.id;
        const textFields = req.body;
        const profilePictureUrl = req.file?.path;
        let basicPatientInfo;
        if (!profilePictureUrl) {
            basicPatientInfo = textFields;
        } else {
            basicPatientInfo = { ...textFields, profilePicture: profilePictureUrl };
        }

        const result = await updateBasicPatientInfo(userId, basicPatientInfo);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating basic patient info',
        });
    }
}


const handleAddHealthInterests = async(req, res) => {
    try {
        console.log('Handling addHealthInterests request:', req.body, req.user);
        const userId = req.user.id;
        const healthInterestsData = req.body;

        const result = await addHealthInterests(userId, healthInterestsData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding healthInterests details',
        });
    }
}

const handleUpdateHealthInterests = async(req, res) => {
    try {
        console.log('Handling updateHealthInterests request:', req.body, req.user);
        const userId = req.user.id;
        const healthInterestsData = req.body;

        const result = await updateHealthInterests(userId, healthInterestsData);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating health interests',
        });
    }
}


const handleAddPrivacyPreferences = async(req, res) => {
    try {
        console.log('Handling addPrivacyPreferences request:', req.body, req.user);
        const userId = req.user.id;
        const privacyPreferencesData = req.body;

        const result = await addPrivacyPreferences(userId, privacyPreferencesData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding privacyPreferences',
        });
    }
}

const handleUpdatePrivacyPreferences = async (req, res) => {
    try {
        console.log('Handling updatePrivacyPreferences request:', req.body, req.user);

        const userId = req.user.id;
        const privacyPreferencesData = req.body;

        const result = await updatePrivacyPreferences(userId, privacyPreferencesData);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating privacy preferences',
        });
    }
};


const handleAddPatientFinalTouches = async (req, res) => {
    try {
        console.log('Handling addPatientFinalTouches request:', req.body, req.user);

        const userId = req.user.id;
        const finalTouchesData = req.body;

        const result = await addPatientFinalTouches(userId, finalTouchesData);

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding patient final touches',
        });
    }
};


const handleUpdatePatientFinalTouches = async (req, res) => {
    try {
        console.log('Handling updatePatientFinalTouches request:', req.body, req.user);

        const userId = req.user.id;
        const finalTouchesData = req.body;

        const result = await updatePatientFinalTouches(userId, finalTouchesData);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while updating patient final touches',
        });
    }
};


const handleAddJoinedCommunitiesArray = async (req, res) => {
    try {
        console.log('Handling addJoinedCommunitiesArray request:', req.body, req.user);

        const userId = req.user.id;
        const communitiesData = req.body;

        const result = await addJoinedCommunitiesArray(userId, communitiesData);

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while adding joined communities',
        });
    }
};


const handleLeaveCommunities = async (req, res) => {
    try {
        console.log('Handling leaveCommunities request:', req.body, req.user);

        const userId = req.user.id;
        const communitiesData = req.body;

        const result = await leaveCommunities(userId, communitiesData);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while leaving communities',
        });
    }
};

