const {createAdmin, editAdmin} = require("services/profile/admin.service")

const handleCreateAdmin = async(req, res) => {
    try {
        const userId = req.user.id;
        const adminData = req.body;
        const response = await createAdmin(userId, adminData);
        res.status(201).json(response);
    }catch(error) {
        res.status(400).json({
            success: false,
            message: error.message || "An error occured while creating admin"
        })
    }
}


const handleEditAdmin = async(req, res) => {
    try {
        const userId = req.user.id;
        const adminData = req.body;
        const response = await editAdmin(userId, adminData);
        res.status(201).json(response);
    }catch(error) {
        res.status(400).json({
            success: false,
            message: error.message || "An error occured while editing admin"
        })
    }
}

module.exports = {handleCreateAdmin, handleEditAdmin}
