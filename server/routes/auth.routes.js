const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes - user profile
router.get('/profile/:id', authMiddleware.protect, authController.getProfile);

// Admin-only routes for user management
router.post('/users', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.createUser);
router.get('/users', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.getAllUsers);
router.put('/users/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.updateUser);
router.delete('/users/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), authController.deleteUser);

module.exports = router; 