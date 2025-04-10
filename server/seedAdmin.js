const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poinpro';

// Admin credentials
const adminUser = {
  name: 'Administrateur',
  email: 'moundir@nedjm-froid.com',
  password: 'nedjmfroid1999',
  role: 'admin',
  active: true
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Update admin
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        updatedAt: new Date()
      });
      
      console.log('Admin password updated successfully');
    } else {
      console.log('Creating new admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Create admin user
      const newAdmin = await User.create({
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: adminUser.active
      });
      
      console.log(`Admin user created with ID: ${newAdmin._id}`);
    }
    
    console.log('Admin user seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run the seeder
seedAdmin(); 