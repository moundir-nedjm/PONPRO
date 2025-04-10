const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In a production app, this would be stored in a secure environment variable
const JWT_SECRET = 'pointgee_secure_jwt_secret_key';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
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
        message: 'Email/ID est requis'
      });
    }
    
    // Find user by email or employeeId
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { employeeId: identifier }
      ]
    });
    
    if (!user) {
      console.log(`Login failed: User not found with identifier ${identifier}`);
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log(`Login failed: Invalid password for ${identifier}`);
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }
    
    console.log(`Login successful for ${user.email} (${user.name}) with role: ${user.role}`);
    
    // Update last login time
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Convert document to plain object and remove sensitive fields
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

// Handle user logout
exports.logout = async (req, res) => {
  // In a stateless JWT implementation, the client is responsible for removing the token
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
};

// Create a new user account (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, employeeId, projects } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà enregistré'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      employeeId,
      projects,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Don't return password
    const userObj = newUser.toObject();
    delete userObj.password;
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: userObj
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'utilisateur'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Convert to plain object and remove sensitive fields
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil'
    });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if employeeId filter is provided
    const { employeeId } = req.query;
    
    // Build filter query
    let query = {};
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, projects, password } = req.body;
    
    // Build update object
    const updateData = {
      name,
      email,
      role,
      projects,
      updatedAt: new Date()
    };
    
    // If password is being updated, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'utilisateur'
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'utilisateur'
    });
  }
}; 