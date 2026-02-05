const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

// All routes require authentication
router.use(authenticateToken);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get messages with a specific user
router.get('/history/:otherUserId', messageController.getMessages);

// Send a message
router.post('/', messageController.sendMessage);

// Mark messages as read
router.put('/read/:otherUserId', messageController.markAsRead);

// Get unread count
router.get('/unread/count', messageController.getUnreadCount);

// Get all users (for starting conversations)
router.get('/users', messageController.getAllUsers);

module.exports = router;
