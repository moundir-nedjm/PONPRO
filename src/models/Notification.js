const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  type: {
    type: String,
    enum: ['sms', 'email', 'push', 'in_app'],
    required: true
  },
  channel: {
    type: String,
    enum: ['attendance', 'leave', 'performance', 'document', 'system', 'other'],
    default: 'system'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  // Store delivery details returned by the SMS/notification provider
  deliveryDetails: {
    provider: String,
    messageId: String,
    segments: Number,
    cost: Number,
    error: String
  },
  // Store metadata for related entities
  metadata: {
    relatedEntity: {
      type: String,
      enum: ['attendance', 'leave', 'evaluation', 'document', 'other']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    date: Date,
    additionalData: mongoose.Schema.Types.Mixed
  },
  // Schedule notification for future delivery
  scheduledFor: {
    type: Date
  },
  // For recurring notifications
  recurrence: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    endDate: Date
  },
  actions: [{
    type: {
      type: String,
      enum: ['link', 'button', 'reply']
    },
    label: String,
    url: String,
    actionId: String
  }],
  // Track notification attempts for retry logic
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create index for scheduled notifications
NotificationSchema.index({ scheduledFor: 1, status: 1 });

// Create index for user notifications
NotificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });

// Create compound index for notifications by type and status
NotificationSchema.index({ type: 1, status: 1 });

// Static method to send notification
NotificationSchema.statics.sendNotification = async function(notificationData) {
  const notification = new this(notificationData);
  
  // If it's scheduled for the future, just save it
  if (notification.scheduledFor && notification.scheduledFor > new Date()) {
    return notification.save();
  }
  
  // Otherwise, try to send immediately
  try {
    // Implementation depends on notification type
    switch (notification.type) {
      case 'sms':
        // Logic for sending SMS would go here
        notification.status = 'sent';
        notification.sentAt = new Date();
        break;
      case 'email':
        // Logic for sending email would go here
        notification.status = 'sent';
        notification.sentAt = new Date();
        break;
      case 'push':
        // Logic for sending push notification would go here
        notification.status = 'sent';
        notification.sentAt = new Date();
        break;
      case 'in_app':
        // For in-app, just mark as sent since it will be delivered when the user logs in
        notification.status = 'sent';
        notification.sentAt = new Date();
        break;
    }
    
    return notification.save();
  } catch (error) {
    notification.status = 'failed';
    notification.deliveryDetails = { error: error.message };
    notification.attempts += 1;
    notification.lastAttempt = new Date();
    return notification.save();
  }
};

// Method to mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to retry failed notification
NotificationSchema.methods.retry = async function() {
  if (this.status !== 'failed') {
    throw new Error('Only failed notifications can be retried');
  }
  
  this.status = 'pending';
  this.attempts += 1;
  this.lastAttempt = new Date();
  await this.save();
  
  // Use the static method to actually send the notification
  return this.constructor.sendNotification(this);
};

module.exports = mongoose.model('Notification', NotificationSchema); 