const { basicUtils } = require('utils');

const createEnumWithArray = basicUtils.createEnumWithArray;

const {obj: rolesObj, array: rolesArray} = createEnumWithArray({
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
    SUPERADMIN: 'super-admin',
});

const {obj: issuingAuthObj, array: issuingAuthArray} = createEnumWithArray({
    PMC: 'PMC',
    NMC: 'NMC',
    GMC: 'GMC',
    OTHER: 'OTHER',
});

const {obj: workPlacesObj, array: workPlacesArray} = createEnumWithArray({
    CURRENT: 'CURRENT',
    PREVIOUS: 'PREVIOUS'
});

const {obj: genderObj, array: genderArray} = createEnumWithArray({
    MALE: 'MALE',
    FEMALE: 'FEMALE'
});

module.exports = {
    rolesObj, 
    rolesArray, 
    issuingAuthObj, 
    issuingAuthArray, 
    workPlacesObj, 
    workPlacesArray,
    genderObj,
    genderArray
}