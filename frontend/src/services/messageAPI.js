import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Message API
export const messageAPI = {
    // Get all conversations
    getConversations: () => axios.get(`${API_URL}/messages/conversations`),

    // Get message history with specific user
    getMessages: (otherUserId, limit = 50, offset = 0) =>
        axios.get(`${API_URL}/messages/history/${otherUserId}`, {
            params: { limit, offset }
        }),

    // Send a message
    sendMessage: (recipientId, content) =>
        axios.post(`${API_URL}/messages`, { recipientId, content }),

    // Mark messages as read
    markAsRead: (otherUserId) =>
        axios.put(`${API_URL}/messages/read/${otherUserId}`),

    // Get unread count
    getUnreadCount: () => axios.get(`${API_URL}/messages/unread/count`),

    // Get all users (for starting new conversations)
    getAllUsers: () => axios.get(`${API_URL}/messages/users`),
};
