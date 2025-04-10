const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pointage-secret-key';

// Mock user data for development
const mockUsers = {
  'user123': {
    id: 'user123',
    name: 'Employe Test',
    email: 'employe@example.com',
    role: 'employee'
  },
  'admin123': {
    id: 'admin123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  },
  'chef123': {
    id: 'chef123',
    name: 'Chef Projet',
    email: 'chef@example.com',
    role: 'chef'
  }
};

/**
 * Middleware to verify JWT token and add user data to request
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, if no token is provided, use a mock user
      if (process.env.NODE_ENV !== 'production') {
        console.log('No token provided, using mock user for development');
        req.user = mockUsers['user123']; // Default to employee user
        return next();
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // For development, if token verification fails, use a mock user
      if (process.env.NODE_ENV !== 'production') {
        console.log('Token verification failed, using mock user for development');
        req.user = mockUsers['user123']; // Default to employee user
        return next();
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

module.exports = {
  verifyToken
}; 