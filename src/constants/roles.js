const { basicUtils } = require('utils');

const createEnumWithArray = basicUtils.createEnumWithArray;

const {obj: rolesObj, array: rolesArray} = createEnumWithArray({
    USER: 'user',
    DOCTOR: 'doctor',
    ADMIN: 'admin'
});

module.exports = {
    rolesObj, rolesArray
}