const mongoose = require("mongoose");
const {validateKeys, makeSetObj} = require('utils/validation.utils')

/**
 * Creates a whitelist + sanitizer middleware for nested updates
 */

const validateRequestFields = (schema, path) => {

    return (req, res, next) => {

        try {
            const input = req.body;

            validateKeys(
                input,
                schema.obj
            );

            // Object.keys(input).forEach(key=>{
            //     setObj[`${path}.${key}`] = input[key]
            // })

           const setObj = makeSetObj(input);

            req.updateData = setObj;

            next();

        } catch (error) {

            return res.status(400).json({
                message: error.message
            });

        }

    };

};

module.exports = {validateRequestFields}