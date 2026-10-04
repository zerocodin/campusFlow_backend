require('dotenv').config();
const connectDB = require('./src/config/db');
const Staff = require('./src/models/staff.model');

(async () => {
  await connectDB();
  const existing = await Staff.findOne({ role: 'super_admin' });
  if (existing) {
    console.log('Super admin already exists');
    process.exit();
  }
  await Staff.create({
    name: 'Super Admin',
    email: 'admin@campusflow.com',
    password: 'Admin@123456',
    role: 'super_admin',
    isEmailVerified: true,
  });
  console.log('Super admin created: admin@campusflow.com / Admin@123456');
  process.exit();
})();