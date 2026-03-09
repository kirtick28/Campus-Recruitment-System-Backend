import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/modules/users/user.model.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Database connected');

    const existingAdmin = await User.findOne({
      role: 'SYSTEM_ADMIN',
    });

    if (existingAdmin) {
      console.log('SYSTEM_ADMIN already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@sece.ac.in',
      password: 'admin@123',
      role: 'SYSTEM_ADMIN',
    });

    console.log('Super Admin created successfully');
    console.log('Email:', admin.email);
    console.log('Password: admin@123');

    process.exit();
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
