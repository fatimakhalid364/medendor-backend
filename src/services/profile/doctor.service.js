const {BasicProfile}= require('models/basicProfile.model.js');
const {Doctor}= require('models/doctor.model.js');
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
        { runValidators: true, strict: true }, 
    );

    if (!updatedProfile) {
            throw new AppError(
            "Basic doctor info not found for this user.",
            404,
            "BASIC_DOCTOR_INFO_NOT_FOUND"
        );
    }

    return { success: true, message: `Basic Doctor Info updated successfully.` };
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
    return { success: true, message: `Professional details added successfully.` };

}

const updateProfessionalDetails = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {user: userId}, 
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

    return { success: true, message: "Professional details updated successfully." };
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
    return { success: true, message: `Credentials added successfully.` };

} 

const updateCredentials = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {user: userId}, 
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

    return { success: true, message: "Credentials updated successfully." };
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
    return { success: true, message: `Availability details added successfully.` };

} 


const updateAvailabilityDetails = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {user: userId}, 
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

    return { success: true, message: "Availability details updated successfully." };
} 


//communitiesToJoin

const addJoinedCommunitiesArray = async (userId, joinedCommunitiesArray) => {
    console.log('Inside addJoinedCommunities service:', 'data:',joinedCommunitiesArray, 'and id:', userId);
    let existingDoctorDetails = await Doctor.findOne({ user: userId });

    if (!existingDoctorDetails) {
        throw new AppError(
            "Please add basic profile before adding joined communities.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    existingDoctorDetails.joinedCommunities = [
        ...new Set([...existingDoctorDetails.joinedCommunities, ...joinedCommunitiesArray])
    ];
    await existingDoctorDetails.save();
    return { success: true, message: `Joined communities added successfully.` };
} 


const leaveCommunities = async (userId, leftCommunitiesArray) => {
    console.log('Inside leaveCommunities service:', 'data:', leftCommunitiesArray, 'and id:', userId);

    const existingDoctorDetails = await Doctor.findOne({ user: userId });
    if (!existingDoctorDetails) {
        throw new AppError(
            "Please add basic profile before leaving communities.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (Array.isArray(existingDoctorDetails.joinedCommunities) && existingDoctorDetails.joinedCommunities.length > 0) {
        existingDoctorDetails.joinedCommunities = existingDoctorDetails.joinedCommunities.filter(
            (community) => !leftCommunitiesArray.includes(community)
        );

        await existingDoctorDetails.save();
        return { success: true, message: 'Communities left successfully.' };
    }

    return { success: false, message: 'No joined communities found.' };

} 



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
    return { success: true, message: `Final touches added successfully.` };

} 


const updateFinalTouches = async (userId, updateData) => {
    const doctorDetails = await Doctor.findOneAndUpdate(
        {user: userId}, 
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

    return { success: true, message: "Final touches updated successfully." };
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

