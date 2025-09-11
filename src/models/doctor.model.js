const mongoose = require('mongoose');
const {
    availabilityModel: {availabilitySchema}, 
    credentialsModel: {credentialsSchema}, 
    professionalDetailsModel: {professionalDetailsSchema}, 
    finalTouchesModel: {finalTouchesSchema}} = require('docProfile')

const doctorSchema = new mongoose.Schema({
    professionalDetails: professionalDetailsSchema,
    credentials: credentialsSchema,
    availability: availabilitySchema,
    finalTouches: finalTouchesSchema,
}, { _id: false });

module.exports = {doctorSchema};