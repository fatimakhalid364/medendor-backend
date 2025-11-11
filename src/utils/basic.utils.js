const createFrozenEnumArray = (arr) => {
    return Object.freeze(arr) 
};

const createFrozenKeysArray = (obj) => {
    return Object.freeze(Object.values(obj)) 
};

const isEmptyDeep = (obj) => {
    if (obj == null) return true; 

    if (typeof obj === "string") return obj.trim() === "";
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === "object") {
        return Object.values(obj).every(value => isEmptyDeep(value));
    }
    return false;
}

module.exports = {createFrozenEnumArray, isEmptyDeep}
