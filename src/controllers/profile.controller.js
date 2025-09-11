const {profileServices: {addDoctorProfile, getDoctorProfile}} = require('services');

const handleAddDoctorProfile = async(req, res) => {
    try {
        console.log('Handling addDoctorProfile request:', req.body, req.user);
        const userId = req.user.id;
        const doctorData = req.body;

        const result = await addDoctorProfile(userId, doctorData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while creating doctor profile',
        });
    }
}

const handleGetDoctorProfile = async(req, res) => {
    try {
        console.log('Handling getDoctorProfile request:', req.user);
        const userId = req.user.id;

        const result = await getDoctorProfile(userId);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'An error occurred while getting doctor profile',
        });
    }
}

module.exports = { handleAddDoctorProfile, handleGetDoctorProfile };