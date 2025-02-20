import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = new User({
      name: 'Test Employee',
      email: 'test@example.com',
      phone: '+917892199398',
      password: hashedPassword,
      role: 'employee'
    });

    await user.save();
    console.log('User seeded successfully');
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedUser();
