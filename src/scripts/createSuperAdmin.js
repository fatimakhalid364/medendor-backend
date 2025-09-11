require('module-alias/register');
const mongoose = require('mongoose');
const {user: User} = require('models');
const {env: {MONGO_URI, SUPER_ADMIN_PASSWORD}} = require('config');
const {bcryptUtils: {hashPassword}} = require('utils');

async function createSuperAdmin() {
    try {
        await mongoose.connect(MONGO_URI);

        const existing = await User.findOne({ role: 'super-admin' });
        if (existing) {
        console.log('❌ Super admin already exists');
        process.exit(0);
        }

        const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD);

        const superAdmin = new User({
        name: 'Fatima Khalid',
        email: 'khalidfatima364@gmail.com',
        password: hashedPassword,
        role: 'super-admin',
        });

        await superAdmin.save();

        console.log('✅ Super admin created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating super admin:', err);
        process.exit(1);
    }
}

createSuperAdmin();
