const Employee = require('../models/Employee');
const crypto = require('crypto');

// In a production app, this would be stored in a secure environment variable
const JWT_SECRET = 'pointgee_secure_jwt_secret_key';

// Simple JWT token generation
const generateToken = (userId) => {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  // In a real app, this would use a proper JWT library
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Handle user login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    console.log(`Login attempt: ${identifier}`);
    
    if (!identifier) {
      console.log('Login rejected: No identifier provided');
      return res.status(400).json({
        success: false,
        message: 'Email/ID is required'
      });
    }
    
    // Find employee by email or employeeId
    const employee = await Employee.findOne({
      $or: [
        { email: identifier },
        { employeeId: identifier }
      ]
    });
    
    if (!employee) {
      console.log(`Login failed: User not found with identifier ${identifier}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // For demo purposes, we're accepting any password
    // Comment out password check for now
    // In a real app, use proper password hashing and verification
    console.log(`Login successful for ${employee.email} (${employee.firstName} ${employee.lastName}) with role: ${employee.role}`);
    
    // Generate session token
    const token = generateToken(employee._id);
    
    // Convert Mongoose document to plain object and remove sensitive fields
    const user = employee.toObject();
    delete user.password;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Handle user logout
exports.logout = async (req, res) => {
  // In a real app with proper JWT implementation,
  // you might want to invalidate the token here
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    // In a real app, this would use the authenticated user ID from req.user
    // which would be set by an auth middleware
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const employee = await Employee.findById(userId);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Convert to plain object and remove sensitive fields
    const user = employee.toObject();
    delete user.password;
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
}; 