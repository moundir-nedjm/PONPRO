const express = require('express');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} = require('../controllers/departmentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Department routes
router.route('/')
  .get(getDepartments)
  .post(authorize('admin'), createDepartment);

router.route('/:id')
  .get(getDepartment)
  .put(authorize('admin'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

// Get department statistics
router.get('/:id/stats', authorize('admin', 'manager'), getDepartmentStats);

// Temporary route for force-deleting a department (USE WITH CAUTION)
router.delete('/:id/force', authorize('admin'), async (req, res) => {
  try {
    // Use direct deletion without checking for employees
    const result = await require('mongoose').model('Department').findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Department not found with id of ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Department force deleted successfully',
      data: {}
    });
  } catch (err) {
    console.error('Error force deleting department:', err);
    res.status(500).json({
      success: false,
      message: 'Error force deleting department'
    });
  }
});

module.exports = router; 