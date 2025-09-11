const express = require('express');
const router = express.Router();
const { symptomCheckerControllers: {handleGetMatchingConditions} } = require('controllers');
const { symptomCheckerMiddlewares: {validateSymptomsArray} } = require('middlewares');

router.get('/symptom-checker', validateSymptomsArray, handleGetMatchingConditions);

module.exports = router;