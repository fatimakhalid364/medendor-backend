const express = require('express');
const router = express.Router();
const {authenticateSession} = require('middlewares/auth.middleware');
const { handleEditAdmin, handleCreateAdmin } = require('controllers/profile/admin.controller');

router.post(
    '/admin',
    authenticateSession,
    validateIsSuperAdmin,
    handleCreateAdmin
);

router.patch(
    '/admin',
    authenticateSession,
    validateIsSuperAdmin,
    handleEditAdmin
)

module.exports = router;
