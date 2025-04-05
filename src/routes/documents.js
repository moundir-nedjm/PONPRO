const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Simple placeholder route
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Documents route is working - functionality temporarily disabled'
  });
});

// Add DELETE endpoint for documents
router.delete('/:id', protect, (req, res) => {
  try {
    // In a real implementation, this would delete from database
    // For now, just return success since frontend is using mock data
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: {}
    });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

module.exports = router; 