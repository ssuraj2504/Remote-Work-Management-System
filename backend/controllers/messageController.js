const db = require('../config/database');

/**
 * Get all conversations for a user
 * Returns list of users they've messaged with, last message, and unread count
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const query = `
            WITH conversation_messages AS (
                SELECT DISTINCT
                    CASE 
                        WHEN sender_id = $1 THEN recipient_id
                        ELSE sender_id
                    END AS other_user_id
                FROM messages
                WHERE sender_id = $1 OR recipient_id = $1
            ),
            last_messages AS (
                SELECT DISTINCT ON (
                    CASE 
                        WHEN sender_id = $1 THEN recipient_id
                        ELSE sender_id
                    END
                )
                    CASE 
                        WHEN sender_id = $1 THEN recipient_id
                        ELSE sender_id
                    END AS other_user_id,
                    content AS last_message,
                    created_at AS last_message_time,
                    sender_id = $1 AS sent_by_me
                FROM messages
                WHERE sender_id = $1 OR recipient_id = $1
                ORDER BY 
                    CASE 
                        WHEN sender_id = $1 THEN recipient_id
                        ELSE sender_id
                    END,
                    created_at DESC
            ),
            unread_counts AS (
                SELECT 
                    sender_id AS other_user_id,
                    COUNT(*) AS unread_count
                FROM messages
                WHERE recipient_id = $1 AND is_read = FALSE
                GROUP BY sender_id
            )
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.role,
                lm.last_message,
                lm.last_message_time,
                lm.sent_by_me,
                COALESCE(uc.unread_count, 0) AS unread_count
            FROM conversation_messages cm
            JOIN users u ON u.id = cm.other_user_id
            LEFT JOIN last_messages lm ON lm.other_user_id = cm.other_user_id
            LEFT JOIN unread_counts uc ON uc.other_user_id = cm.other_user_id
            ORDER BY lm.last_message_time DESC NULLS LAST
        `;

        const result = await db.query(query, [userId]);

        res.json({
            success: true,
            conversations: result.rows,
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            error: 'Failed to fetch conversations',
        });
    }
};

/**
 * Get message history with a specific user
 */
const getMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherUserId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const query = `
            SELECT 
                m.id,
                m.sender_id,
                m.recipient_id,
                m.content,
                m.is_read,
                m.created_at,
                sender.full_name AS sender_name,
                recipient.full_name AS recipient_name
            FROM messages m
            JOIN users sender ON sender.id = m.sender_id
            JOIN users recipient ON recipient.id = m.recipient_id
            WHERE 
                (m.sender_id = $1 AND m.recipient_id = $2)
                OR (m.sender_id = $2 AND m.recipient_id = $1)
            ORDER BY m.created_at DESC
            LIMIT $3 OFFSET $4
        `;

        const result = await db.query(query, [userId, otherUserId, limit, offset]);

        res.json({
            success: true,
            messages: result.rows.reverse(), // Reverse to show oldest first
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            error: 'Failed to fetch messages',
        });
    }
};

/**
 * Send a new message
 */
const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const { recipientId, content } = req.body;

        if (!recipientId || !content || !content.trim()) {
            return res.status(400).json({
                error: 'Recipient ID and message content are required',
            });
        }

        // Verify recipient exists
        const recipientCheck = await db.query(
            'SELECT id FROM users WHERE id = $1',
            [recipientId]
        );

        if (recipientCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Recipient not found',
            });
        }

        const query = `
            INSERT INTO messages (sender_id, recipient_id, content)
            VALUES ($1, $2, $3)
            RETURNING 
                id,
                sender_id,
                recipient_id,
                content,
                is_read,
                created_at
        `;

        const result = await db.query(query, [senderId, recipientId, content.trim()]);
        const message = result.rows[0];

        // Get sender info
        const senderInfo = await db.query(
            'SELECT full_name, email FROM users WHERE id = $1',
            [senderId]
        );

        message.sender_name = senderInfo.rows[0].full_name;

        res.status(201).json({
            success: true,
            message,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            error: 'Failed to send message',
        });
    }
};

/**
 * Mark messages as read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherUserId } = req.params;

        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE
            RETURNING id
        `;

        const result = await db.query(query, [userId, otherUserId]);

        res.json({
            success: true,
            marked_count: result.rows.length,
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            error: 'Failed to mark messages as read',
        });
    }
};

/**
 * Get unread message count
 */
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const query = `
            SELECT COUNT(*) AS unread_count
            FROM messages
            WHERE recipient_id = $1 AND is_read = FALSE
        `;

        const result = await db.query(query, [userId]);

        res.json({
            success: true,
            unread_count: parseInt(result.rows[0].unread_count),
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            error: 'Failed to get unread count',
        });
    }
};

/**
 * Get list of all users (for starting new conversations)
 */
const getAllUsers = async (req, res) => {
    try {
        const userId = req.user.userId;

        const query = `
            SELECT 
                id,
                full_name,
                email,
                role
            FROM users
            WHERE id != $1
            ORDER BY full_name ASC
        `;

        const result = await db.query(query, [userId]);

        res.json({
            success: true,
            users: result.rows,
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
        });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getAllUsers,
};
