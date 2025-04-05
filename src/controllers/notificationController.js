const Notification = require('../models/Notification');
const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, type, channel } = req.query;
    
    // Build filter object
    const filter = { recipient: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (channel) {
      filter.channel = channel;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find notifications with pagination
    const notifications = await Notification.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Notification.countDocuments(filter);
    
    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      status: { $ne: 'read' }
    });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private/Admin/Manager
exports.createNotification = async (req, res, next) => {
  try {
    // Set creator to current user
    req.body.createdBy = req.user.id;
    
    // Create notification
    const notification = await Notification.sendNotification(req.body);
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create bulk notifications (send to multiple recipients)
// @route   POST /api/notifications/bulk
// @access  Private/Admin/Manager
exports.createBulkNotifications = async (req, res, next) => {
  try {
    const { recipients, employeeIds, departmentId, message, title, type, channel, metadata, scheduledFor, priority } = req.body;
    
    // Validate required fields
    if (!message || !title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Message, title and type are required'
      });
    }
    
    // Find recipient users based on provided criteria
    let targetRecipients = [];
    
    if (recipients && recipients.length > 0) {
      // Direct user IDs
      targetRecipients = recipients;
    } else if (employeeIds && employeeIds.length > 0) {
      // Get users associated with employee IDs
      const employees = await Employee.find({ _id: { $in: employeeIds } });
      const employeeUserIds = employees.map(emp => emp.user).filter(Boolean);
      targetRecipients = [...new Set(employeeUserIds.map(id => id.toString()))];
    } else if (departmentId) {
      // Get all employees in a department
      const employees = await Employee.find({ department: departmentId });
      const employeeUserIds = employees.map(emp => emp.user).filter(Boolean);
      targetRecipients = [...new Set(employeeUserIds.map(id => id.toString()))];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Recipients, employeeIds or departmentId is required'
      });
    }
    
    // Create notifications for each recipient
    const notificationPromises = targetRecipients.map(recipient => {
      const notificationData = {
        recipient,
        message,
        title,
        type,
        channel: channel || 'system',
        metadata,
        scheduledFor,
        priority: priority || 'normal',
        createdBy: req.user.id
      };
      
      return Notification.sendNotification(notificationData);
    });
    
    // Wait for all notifications to be created
    const notifications = await Promise.all(notificationPromises);
    
    res.status(201).json({
      success: true,
      count: notifications.length,
      data: {
        sentCount: notifications.length,
        recipients: targetRecipients
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    // Mark as read
    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { 
        recipient: req.user.id,
        status: { $ne: 'read' }
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has access to delete this notification
    if (notification.recipient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Retry a failed notification
// @route   PUT /api/notifications/:id/retry
// @access  Private/Admin
exports.retryNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Only admin can retry notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to retry notifications'
      });
    }

    // Check if notification is failed
    if (notification.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Only failed notifications can be retried'
      });
    }

    // Retry notification
    const retriedNotification = await notification.retry();

    res.status(200).json({
      success: true,
      data: retriedNotification
    });
  } catch (err) {
    next(err);
  }
}; 