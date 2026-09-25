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
        console.log('Handling addBasicPatientInfo request:', req.body, req.user);
        const userId = req.user.id;
        const textFields = req.body;
        const profilePictureUrl = req.file?.path;
        const basicPatientInfo = { ...textFields, profilePicture: profilePictureUrl };

        const result = await addBasicPatientInfo(userId, basicPatientInfo);
        res.status(201).json(result);
    } 


const handleUpdateBasicPatientInfo = async(req, res) => {
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
    } 


const handleAddHealthInterests = async(req, res) => {
        console.log('Handling addHealthInterests request:', req.body, req.user);
        const userId = req.user.id;
        const healthInterestsData = req.body;

        const result = await addHealthInterests(userId, healthInterestsData);
        res.status(201).json(result);
    } 

const handleUpdateHealthInterests = async(req, res) => {
        console.log('Handling updateHealthInterests request:', req.body, req.user);
        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updateHealthInterests(userId, updateData);
        res.status(200).json(result);
    } 


const handleAddPrivacyPreferences = async(req, res) => {
        console.log('Handling addPrivacyPreferences request:', req.body, req.user);
        const userId = req.user.id;
        const privacyPreferencesData = req.body;

        const result = await addPrivacyPreferences(userId, privacyPreferencesData);
        res.status(201).json(result);
    } 

const handleUpdatePrivacyPreferences = async (req, res) => {
        console.log('Handling updatePrivacyPreferences request:', req.body, req.user);

        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updatePrivacyPreferences(userId, updateData);

        res.status(200).json(result);
    } 

const handleAddPatientFinalTouches = async (req, res) => {
        console.log('Handling addPatientFinalTouches request:', req.body, req.user);

        const userId = req.user.id;
        const finalTouchesData = req.body;

        const result = await addPatientFinalTouches(userId, finalTouchesData);

        res.status(201).json(result);
    } 


const handleUpdatePatientFinalTouches = async (req, res) => {
        console.log('Handling updatePatientFinalTouches request:', req.body, req.user);

        const userId = req.user.id;
        const updateData = req.updateData;

        const result = await updatePatientFinalTouches(userId, updateData);

        res.status(200).json(result);
    } 


const handleAddJoinedCommunitiesArray = async (req, res) => {
        console.log('Handling addJoinedCommunitiesArray request:', req.body, req.user);

        const userId = req.user.id;
        const communitiesData = req.body;

        const result = await addJoinedCommunitiesArray(userId, communitiesData);

        res.status(201).json(result);
    } 

const handleLeaveCommunities = async (req, res) => {

        console.log('Handling leaveCommunities request:', req.body, req.user);

        const userId = req.user.id;
        const communitiesData = req.body;

        const result = await leaveCommunities(userId, communitiesData);

        res.status(200).json(result);
    } 


module.exports = {
    handleAddBasicPatientInfo,
    handleUpdateBasicPatientInfo,
    handleAddHealthInterests,
    handleUpdateHealthInterests,
    handleAddJoinedCommunitiesArray,
    handleLeaveCommunities,
    handleAddPatientFinalTouches,
    handleUpdatePatientFinalTouches,
    handleAddPrivacyPreferences,
    handleUpdatePrivacyPreferences
}

