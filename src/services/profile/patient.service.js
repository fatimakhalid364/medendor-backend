const BasicProfile = require('models/basicProfile.model');
const mongoose = require('mongoose');
const Patient = require('models/patient.model');

const AppError = require('utils/appError.utils');

const addBasicPatientInfo = async(userId, basicPatientInfo)=> {
    const session = await mongoose.startSession();
    
        try {
            session.startTransaction();
    
            console.log('Inside addBasicPatientInfo service:', { userId, basicPatientInfo });
    
            const existingProfile = await BasicProfile.findOne({ user: userId }).session(session);
            if (existingProfile) {
                throw new AppError(
                    'Basic patient info already registered.',
                    409,
                    'BASIC_PATIENT_INFO_ALREADY_ADDED'
                );
            }
    
            const basicProfile = new BasicProfile({
                user: userId,
                ...basicPatientInfo,
            });
            await basicProfile.save({ session });
    
            const patient = new Patient({
                user: userId,
                basicProfile: basicProfile._id,
            });
            await patient.save({ session });
    
            await session.commitTransaction();
    
            return {
                success: true,
                code: 'BASIC_PATIENT_INFO_ADDED',
                message: 'Basic patient info created and linked successfully.',
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
                'Unable to add basic patient info.',
                500,
                'ADD_BASIC_PATIENT_INFO_FAILED'
            );
        } finally {
            session.endSession();
        }
}


const updateBasicPatientInfo = async (userId, basicPatientInfo) => {
        const updatedProfile = await BasicProfile.findOneAndUpdate(
            { user: userId },
            { $set: basicPatientInfo },
            { runValidators: true, strict: true }, 
        );

        if (!updatedProfile) {
            throw new AppError(
                "Basic patient info not found for this user.",
                409,
                "BASIC_PATIENT_INFO_NOT_FOUND"
            );
        }

        return { 
            success: true,
            CODE: 'BASIC_PATIENT_INFO_UPDATED', 
            message: `Basic Patient Info updated successfully.` };
} 


const addHealthInterests = async(userId, healthInterestsData)=> {
    console.log("Inside addHealthInterests service")
    const existingPatientDetails = await Patient.findOne({user: userId});
    if (!existingPatientDetails){
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    // const detailsObj = existingPatientDetails?.toObject?.() || {}
    if (existingPatientDetails.healthInterests){
        throw new AppError(
            "Health interests already added.",
            409,
            'HEALTH_INTERESTS_ALREADY_ADDED'
        )
    }
    existingPatientDetails.healthInterests = healthInterestsData;
    await existingPatientDetails.save();

    return { 
        success: true, 
        code: 'HEALTH_INTERESTS_ADDED',
        message: `Health interests added successfully.` };
}

const updateHealthInterests = async(userId, updateData)=> {
    console.log("Inside updateHealthInterests service");
    // Object.keys(healthInterestsData).forEach(key=>
    //     {
    //         if(!(key in healthInterestsSchema.paths)){
    //             throw new Error(`Invalid key ${key}`)
    //         }
    //         setObj[`healthInterests.${key}`] = healthInterestsData[key]
    //     }
    // )
    const patientDetails = await Patient.findOneAndUpdate(
        {user: userId}, 
        {$set: updateData},
        {
            runValidators: true,
            strict: true,
            new: true
        }
    );

    if (!patientDetails){
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    return { 
        success: true,
        code: 'HEALTH_INTERESTS_UPDATED', 
        message: `Health interests updated successfully.` };
}

const addPrivacyPreferences = async(userId, privacyPreferencesData)=> {
    console.log("inside addPrivacyPreferences service");
    const existingPatientDetails = await Patient.findOne({user: userId})
    if (!existingPatientDetails){
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    // const detailsObj = existingPatientDetails?.privacyPreferences?.toObject?.() || {};

    if(existingPatientDetails.privacyPreferences){
        throw new AppError(
            "Privacy preferences already added.",
            409,
            'PRIVACY_PREFERENCES_ALREADY_ADDED'
        )
    }

    existingPatientDetails.privacyPreferences = privacyPreferencesData;

    await existingPatientDetails.save();

    return { 
        success: true,
        code: 'PRIVACY_PREFERENCES_ADDED', 
        message: `Privacy preferences added successfully.` 
    };

}


const updatePrivacyPreferences = async(userId, updateData)=> {
    console.log("Inside updateprivacyPreferences service");
        
        // Object.keys(privacyPreferencesData).forEach(key=>{
        //         if(!(key in privacyPreferencesSchema.paths)){
        //         throw new Error(`Invalid key ${key}`)
        //         }
        //         setObj[`privacyPreferences.${key}`] = privacyPreferencesData[key]
        //     }
        // )
    const patientDetails = await Patient.findOneAndUpdate(
        {user: userId}, 
        {$set: updateData},
        {
            runValidators: true,
            strict: true,
            new: true
        }
    );

    if (!patientDetails){
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    return { 
        success: true, 
        code: 'PRIVACY_PREFERENCES_UPDATED',
        message: `Privacy preferences updated successfully.` 
    };

}

const addPatientFinalTouches = async (userId, finalTouchesData) => {
    console.log('Inside addPatientFinalTouches service:', 'data:',finalTouchesData, 'and id:', userId);
    let existingPatientDetails = await Patient.findOne({ user: userId });

    if (!existingPatientDetails) {
        throw new AppError(
            "Please add basic profile before adding health interests.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }

    if (existingPatientDetails.finalTouches) {
        throw new AppError(
            "Final touches already added.",
            409,
            'FINAL_TOUCHES_ALREADY_ADDED'
        )
    } 

    existingPatientDetails.finalTouches = finalTouchesData;
    await existingPatientDetails.save();
    return { 
        success: true,
        code: 'FINAL_TOUCHES_ADDED', 
        message: `Final touches added successfully.` 
    };
} 

const updatePatientFinalTouches = async (userId, updateData) => {
    console.log("Inside updatePatientFinalTouches service.");

    // const updatedFields = {};
    // for(const [key, value] of Object.entries(finalTouchesData)){
    //     if (!(key in finalTouchesSchema.paths)){
    //         throw new Error(`Invalid key:${key}`)
    //     }
    //     for (const [subKey, subValue] of Object.keys(value)){
    //         if(!(subKey in finalTouchesSchema.paths[key].schema.paths)){
    //             throw new Error(`Invalid subKey: ${subKey}`)
    //         }
    //         updatedFields[`finalTouches.${key}.${subKey}`] = subValue
    //     }
    // }

    const patientDetails = await Patient.findOneAndUpdate(
        {user: userId},
        {$set: updateData},
        {
            runValidators: true,
            new: true,
            strict: true
        }
    );

    if (!patientDetails){
        throw new AppError(
            "Basic profile not added for this user.",
            409,
            'BASIC_PROFILE_MISSING'
        )
    }
    return { 
        success: true,
        code: 'FINAL_TOUCHES_UPDATED', 
        message: `Patient's final touches updated successfully.` };

}

const addJoinedCommunitiesArray = async (userId, communitiesArray) => {
    console.log('Inside addJoinedCommunities service:', 'data:',communitiesArray, 'and id:', userId);
    const patientDetails = await Patient.findOneAndUpdate(
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

    if (!patientDetails) {
        throw new AppError(
            "Patient profile not found.",
            404,
            "PATIENT_NOT_FOUND"
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

    const result = await Patient.updateOne(
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


module.exports = {
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
}

