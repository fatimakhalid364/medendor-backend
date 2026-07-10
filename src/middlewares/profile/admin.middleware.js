const validateIsSuperAdmin = (req, res, next) => {
    const user = req.user;

    if (!user || !Array.isArray(user.roles) || !user.roles.includes('superAdmin')){
        return res.status(400).json("Access Denied. Only a super-admin can create an admin.")
    }

    next();
}