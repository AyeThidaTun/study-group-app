const express = require('express');
const {
  getGlobalNotifications,
  getPersonalNotifications,
  markNotificationAsRead,
  markNotificationAsUnread
} = require('../models/Notification.model.js');
const router = express.Router();

// Route for fetching global notifications with filter and sorting support
router.get("/announcements", (req, res, next) => {
  const userId = parseInt(req.query.userId, 10); // Convert userId to an integer
  const statusFilter = req.query.status; // Status filter: 'READ', 'UNREAD', or any custom status
  const sortBy = req.query.sortBy; // Sort notifications by 'READ' or 'UNREAD' or 'DATEDESC' or 'DATEASC'

  if (!userId) {
    return res.status(400).json({ error: "User ID is required to fetch announcements." });
  }

  getGlobalNotifications(userId, statusFilter, sortBy)
    .then((notifications) => {
      console.log("Filtered and Sorted Global Notifications:", notifications); // Log the filtered and sorted data
      res.status(200).json(notifications);
    })
    .catch(next);
});

// Route for fetching personal notifications by user ID with filter and sorting support
router.get('/personal', (req, res, next) => {
  const userId = req.query.userId; // Get userId from query params
  const statusFilter = req.query.status; // Status filter for personal notifications
  const sortBy = req.query.sortBy; // Sort notifications by 'READ' or 'UNREAD' or 'DATEDESC' or 'DATEASC'

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  getPersonalNotifications(userId, statusFilter, sortBy)
    .then((notifications) => {
      console.log(`Filtered and Sorted Personal Notifications for User ${userId}:`, notifications); // Log the filtered and sorted data
      res.status(200).json(notifications);
    })
    .catch(next);
});



// Route for marking a notification as read
router.post('/markAsRead', (req, res, next) => {
  const { notificationId, userId } = req.body; // Get notification ID and user ID from request body

  if (!notificationId || !userId) {
    return res.status(400).json({ error: 'Notification ID and User ID are required' });
  }

  markNotificationAsRead(userId, notificationId)
    .then(() => {
      console.log(`Notification ${notificationId} marked as read by user ${userId}`);
      res.status(200).json({ message: `Notification ${notificationId} marked as read` });
    })
    .catch(next);
});


// Route for marking a notification as unread
router.put('/markAsUnread', (req, res) => {
  const { notificationId, userId } = req.body;

  if (!notificationId || !userId) {
    return res.status(400).json({ error: 'Notification ID and User ID are required' });
  }

  markNotificationAsUnread(userId, notificationId)
    .then((response) => {
      console.log(response.message);
      res.status(200).json(response);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(400).json({ error: err.message });
    });
});


module.exports = router;