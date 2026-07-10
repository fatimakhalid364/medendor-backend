const Admin = require('models/admin.model');

const createAdmin = async (userId, adminData) => {
    try{
        const existingAdmin = await Admin.findOne({user: userId});
        if (existingAdmin) {
            throw new Error('This user is already an admin');
        }
        const newAdmin = new Admin({
            user: userId,
            ...adminData
        })

        await newAdmin.save();
        return {
            success: true,
            message: "New admin created successfully"
        }
    }catch(error){
        console.error('Error during creating admin:', error);
        throw new Error(`createAdmin failed: ${error.message}`);
    }
   
}

const editAdmin = async (userId, adminData) => {
    try{
        const editedAdmin = await Admin.findOneAndUpdate({
            user: userId,
            $set: adminData,
            runValidators: true,
            strict: true
        });
        if (!editedAdmin) {
            throw new Error('This user is not an admin');
        }
        return {
            success: true,
            message: "Admin edited successfully"
        }
    }catch(error){
        console.error('Error during editing admin:', error);
        throw new Error(`editAdmin failed: ${error.message}`);
    }
   
};

module.exports = {
    createAdmin,
    editAdmin
}
