const BasicProfile= require('models/basicProfile.model.js');
const Doctor = require('models/doctor.model.js');
const mongoose = require('mongoose');
const AppError = require('utils/appError.utils');



//basicDoctorInfo

const addBasicDoctorInfo = async (userId, basicDoctorInfo) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        console.log('Inside addDoctorBasicInfo service:', { userId, basicDoctorInfo });

        const existingProfile = await BasicProfile.findOne({ user: userId }).session(session);
        if (existingProfile) {
            throw new AppError(
                    'Basic doctor info already registered.',
                    409,
                    'BASIC_DOCTOR_INFO_ALREADY_ADDED'
                );
        }

        const basicProfile = new BasicProfile({
            user: userId,
            ...basicDoctorInfo,
        });
        await basicProfile.save({ session });

        const doctor = new Doctor({
            user: userId,
            basicProfile: basicProfile._id,
        });
        await doctor.save({ session });

        await session.commitTransaction();

        return {
            success: true,
            code: 'BASIC_DOCTOR_INFO_ADDED',
            message: 'Basic doctor info created and linked successfully.',
        };
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error('Error during adding basic patient info:', error);
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            'Unable to add basic doctor info.',
            500,
            'ADD_BASIC_DOCTOR_INFO_FAILED'
        );
    } finally {
        session.endSession();
    }
};

const updateBasicDoctorInfo = async (userId, basicDoctorInfo) => {
    const updatedProfile = await BasicProfile.findOneAndUpdate(
        { user: userId },
        { $set: basicDoctorInfo },
        { 
            new: true,
            runValidators: true, 
            strict: true }, 
    );

    if (!updatedProfile) {
            throw new AppError(
            "Basic doctor info not found for this user.",
            404,
            "BASIC_DOCTOR_INFO_NOT_FOUND"
        );
    }

    return { 
        success: true,
        CODE: 'BASIC_DOCTOR_INFO_UPDATED', 
        message: `Basic Doctor Info updated successfully.` };
} 

//professionalDetails

const addProfessionalDetails = async (userId, professionalDetailsData) => {
    console.log('Inside addProfessionalDetails service:', 'data:',professionalDetailsData, 'and id:', userId);
    let existingDoctorDetails = await Doctor.findOne({ user: userId });

    if (!existingDoctorDetails) {
        throw new AppError(
            "Please add basic profile before adding professional details.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    // const detailsObj = existingDoctorDetails.professionalDetails?.toObject?.() ?? {};
    if (existingDoctorDetails.professionalDetails) {
        throw new AppError(
            "Professional details already added.",
            409,
            'PROFESSIONAL_DETAILS_ALREADY_ADDED'
        )
    } 

    existingDoctorDetails.professionalDetails = professionalDetailsData;
    await existingDoctorDetails.save();
    return { 
        success: true,
        code: 'PROFESSIONAL_DETAILS_ADDED', 
        message: `Professional details added successfully.` };

}

const updateProfessionalDetails = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {
            user: userId,
            professionalDetails: { $exists: true }
        }, 
        {$set: updateData},
            {
                runValidators: true,
                strict: true,
                new: true
            }
        );
    
    if (!doctorDetails){
        throw new AppError(
            "Please add basic profile before updating professional details.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    return { 
        success: true,
        code: 'PROFESSIONAL_DETAILS_UPDATED',
        message: "Professional details updated successfully." };
} 

//credentials


const addCredentials = async (userId, credentialsData) => {
    console.log('Inside addCredentials service:', 'data:',credentialsData, 'and id:', userId);
    let existingDoctorDetails = await Doctor.findOne({ user: userId });

    if (!existingDoctorDetails) {
        throw new AppError(
            "Please add basic profile before adding credentials.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (existingDoctorDetails.credentials) {
        throw new AppError(
            "Credentials already added.",
            409,
            'CREDENTIALS_ALREADY_ADDED'
        )
    } 

    existingDoctorDetails.credentials = credentialsData;
    await existingDoctorDetails.save();
    return { 
        success: true,
        code: 'CREDENTIALS_ADDED', 
        message: `Credentials added successfully.` };

} 

const updateCredentials = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {
            user: userId,
            credentials: { $exists: true }
        }, 
        {$set: updateData},
        {
            runValidators: true,
            strict: true,
            new: true
        }
    );
    
    if (!doctorDetails){
        throw new AppError(
            "Please add basic profile before updating credentials.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    return { 
        success: true,
        code: 'CREDENTIALS_UPDATED', 
        message: "Credentials updated successfully." };
} 

//availability


const addAvailabilityDetails = async (userId, availabilityDetails) => {
    console.log('Inside addAvailabilityDetails service:', 'data:',availabilityDetails, 'and id:', userId);
    let existingDoctorDetails = await Doctor.findOne({ user: userId });

    if (!existingDoctorDetails) {
        throw new AppError(
            "Please add basic profile before adding availability details.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (existingDoctorDetails.availability) {
        throw new AppError(
            "Availability details already added.",
            409,
            'AVALABILITY_DETAILS_ALREADY_ADDED'
        )
    } 

    existingDoctorDetails.availability = availabilityDetails;
    await existingDoctorDetails.save();
    return { 
        success: true,
        code: 'AVAILABILITY_DETAILS_ADDED', 
        message: `Availability details added successfully.` };

} 


const updateAvailabilityDetails = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {
            user: userId,
            availability: { $exists: true }
        }, 
        {$set: updateData},
        {
            runValidators: true,
            strict: true,
            new: true
        }
    );
    
    if (!doctorDetails){
        throw new AppError(
            "Please add basic profile before updating availability details.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    return { 
        success: true,
        code: 'AVAILABILITY_DETAILS_UPDATED', 
        message: "Availability details updated successfully." };
} 


//communitiesToJoin

const addJoinedCommunitiesArray = async (userId, communitiesArray) => {
    console.log('Inside addJoinedCommunities service:', 'data:',communitiesArray, 'and id:', userId);
    const doctorDetails = await Doctor.findOneAndUpdate(
        { user: userId },
        {
            $addToSet: {
                communities: {
                    $each: communitiesArray
                }
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!doctorDetails) {
        throw new AppError(
            "Doctor profile not found.",
            404,
            "DOCTOR_NOT_FOUND"
        );
    }
    return { 
        success: true,
        code: 'JOINED_COMMUNITIES_ADDED', 
        message: `Joined communities added successfully.` 
    };
} 


const leaveCommunities = async (userId, leftCommunitiesArray) => {
    console.log(
        'Inside leaveCommunities service:',
        'data:',
        leftCommunitiesArray,
        'and id:',
        userId
    );

    const result = await Doctor.updateOne(
        { user: userId },
        {
            $pull: {
                communities: {
                    $in: leftCommunitiesArray
                }
            }
        },
        {
            runValidators: true
        }
    );

    if (result.matchedCount === 0) {
        throw new AppError(
            "Please add basic profile before leaving communities.",
            409,
            'BASIC_PROFILE_MISSING'
        );
    }

    if (result.modifiedCount === 0) {
        return {
            success: true,
            code: 'COMMUNITIES_ALREADY_LEFT',
            message: 'None of the requested communities were joined.'
        };
    }

    return {
        success: true,
        code: 'COMMUNITIES_LEFT',
        message: 'Communities left successfully.'
    };
};



//final touches

const addFinalTouches = async (userId, finalTouchesData) => {
    console.log('Inside addFinalTouches service:', 'data:',finalTouchesData, 'and id:', userId);
    let existingDoctorDetails = await Doctor.findOne({ user: userId });

    if (!existingDoctorDetails) {
        throw new AppError(
            "Please add basic profile before adding fonal touches.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (existingDoctorDetails.finalTouches) {
        throw new AppError(
            "Final touches already added.",
            409,
            'FINAL_TOUCHES_ALREADY_ADDED'
        )
    } 

    existingDoctorDetails.finalTouches = finalTouchesData;
    await existingDoctorDetails.save();
    return { 
        success: true,
        code: 'FINAL_TOUCHES_ADDED', 
        message: `Final touches added successfully.` };

} 


const updateFinalTouches = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {
            user: userId,
            finalTouces: { $exists: true }
        }, 
        {$set: updateData},
        {
            runValidators: true,
            strict: true,
            new: true
        }
    );
    
    if (!doctorDetails){
        throw new AppError(
            "Please add basic profile before updating final touches.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    return { 
        success: true,
        code: 'FINAL_TOUCHES_UPDATED', 
        message: "Final touches updated successfully." };
} 

module.exports = {
    addBasicDoctorInfo,
    updateBasicDoctorInfo,
    addProfessionalDetails,
    updateProfessionalDetails,
    addCredentials,
    updateCredentials,
    addAvailabilityDetails,
    updateAvailabilityDetails,
    addJoinedCommunitiesArray,
    leaveCommunities,
    addFinalTouches,
    updateFinalTouches
};

