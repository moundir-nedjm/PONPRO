const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poinpro';

// Admin credentials to test
const credentials = {
  email: 'moundir@nedjm-froid.com',
  password: 'nedjmfroid1999'
};

async function testCredentials() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Find user by email
    console.log(`Looking for user with email: ${credentials.email}`);
    const user = await User.findOne({ email: credentials.email });
    
    if (!user) {
      console.error(`ERROR: User with email ${credentials.email} not found in database`);
      process.exit(1);
    }
    
    console.log(`User found: ${user.name} (${user.role})`);
    
    // Verify password
    console.log('Testing password...');
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    
    if (isPasswordValid) {
      console.log('SUCCESS: Password is valid!');
      console.log('Login credentials are correct and should work in the application.');
      console.log({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    } else {
      console.error('ERROR: Password is invalid');
      console.log('Stored password hash:', user.password);
      
      // Generate hash of the test password to compare
      const testHash = await bcrypt.hash(credentials.password, 10);
      console.log('Test password hash:', testHash);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing credentials:', error);
    process.exit(1);
  }
}

// Run the test
console.log('TESTING ADMIN LOGIN CREDENTIALS');
console.log('==============================');
testCredentials(); 