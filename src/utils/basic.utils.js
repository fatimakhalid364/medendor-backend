const createEnumWithArray = (obj) => {
    const frozenObject = Object.freeze({ ...obj });
    return { obj: frozenObject, array: Object.freeze(Object.values(obj)) 
}};

module.exports = {createEnumWithArray}
