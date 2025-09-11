const {user: User} = require('models');

const addDoctorProfile = async (userId, doctorData) => {
    try {
        console.log('Inside addDoctorProfile service:', userId, 'and doctorData:', doctorData);

        const user = await User.findById(userId).select('doctorDetails');

        if (!user) {
            throw new Error('User not found');
        }

        if (user.doctorDetails && Object.keys(user.doctorDetails.toObject() || {}).length > 0) {
            throw new Error("Doctor profile already exists. Use PUT to update instead.");
        }

        await User.updateOne(
            { _id: userId },
            { $set: { doctorDetails: doctorData } }
        );

        return { success: true, message: `Doctor's profile created successfully.` };
    } catch (error) {
        console.error('Error in addDoctorProfile:', error.message);
        throw new Error(error.message || 'Failed to add doctor profile');
    }
};

const getDoctorProfile = async (userId) => {
    try {
        const user = await User.findById(userId).select('role doctorDetails');

        if (!user) {
            throw new Error('User not found');
        }

        if (!user.doctorDetails || Object.keys(user.doctorDetails.toObject()).length === 0) {
            throw new Error('Doctor profile not created yet');
        }

        return {
            success: true,
            message: 'Doctor profile retrieved successfully',
            doctorDetails: user.doctorDetails.toObject()
        };
    } catch (error) {
        console.error('Error in getDoctorProfile:', error.message);
        throw new Error(error.message || 'Failed to retrieve doctor profile');
    }
};



module.exports = { addDoctorProfile, getDoctorProfile };