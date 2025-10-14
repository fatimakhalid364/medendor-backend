const createFrozenEnumArray = (arr) => {
    return Object.freeze(arr) 
};

const createFrozenKeysArray = (obj) => {
    return Object.freeze(Object.values(obj)) 
};

module.exports = {createFrozenEnumArray}
