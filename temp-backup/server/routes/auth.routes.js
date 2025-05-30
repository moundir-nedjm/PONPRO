const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// Get user profile
router.get('/profile/:id', authController.getProfile);

module.exports = router; 