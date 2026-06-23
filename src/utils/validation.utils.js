const validateKeys = (data, schemaObj) => {

    for (const key of Object.keys(data)) {

        if (!(key in schemaObj)) {
            throw new Error(`Invalid field: ${key}`);
        }

        const schemaValue = schemaObj[key];
        const requestValue = data[key];

        // Nested object
        if (
            requestValue &&
            typeof requestValue === 'object' &&
            !Array.isArray(requestValue) &&
            schemaValue &&
            typeof schemaValue === 'object' &&
            !schemaValue.type
        ) {
            validateKeys(
                requestValue,
                schemaValue
            );
        }

        // Array of objects
        if (
            Array.isArray(requestValue) &&
            Array.isArray(schemaValue) &&
            schemaValue.length > 0 &&
            typeof schemaValue[0] === 'object'
        ) {

            for (const item of requestValue) {

                if (
                    item &&
                    typeof item === 'object' &&
                    !Array.isArray(item)
                ) {
                    validateKeys(
                        item,
                        schemaValue[0]
                    );
                }

            }

        }

    }

};


const makeSetObj = (obj, currentPath = '') => {

    let setObj = {};

    for (const key of Object.keys(obj)) {

        const value = obj[key];

        const newPath = currentPath
            ? `${currentPath}.${key}`
            : key;

        // Nested object
        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {

            Object.assign(
                setObj,
                makeSetObj(value, newPath)
            );

        }

        // Array (including array of objects)
        else if (Array.isArray(value)) {

            setObj[newPath] = value;

        }

        // Primitive value
        else {

            setObj[newPath] = value;

        }

    }

    return setObj;
};

module.exports = {validateKeys, makeSetObj}