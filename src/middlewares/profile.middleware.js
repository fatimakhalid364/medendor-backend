const mongoose = require("mongoose");
const {validateKeys, makeSetObj} = require('utils/validation.utils')

/**
 * Creates a whitelist + sanitizer middleware for nested updates
 */

const makeUpdatePath = (path) => {

    console.log('inside valideRequestFields middelware')

    return (req, res, next) => {

        try {
            console.log('inside valideRequestFields middelware', req.body)
            const input = req.body;

            // Object.keys(input).forEach(key=>{
            //     setObj[`${path}.${key}`] = input[key]
            // })

           const setObj = makeSetObj(input, path);

            req.updateData = setObj;

            next();

        } catch (error) {

            return next(error)

        }

    };

};

module.exports = makeUpdatePath