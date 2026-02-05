const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }
    });

    // Authentication middleware for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userEmail = decoded.email;
            socket.userRole = decoded.role;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId} (${socket.userEmail})`);

        // Add user to online users
        onlineUsers.set(socket.userId, socket.id);

        // Broadcast updated online users list
        io.emit('online_users', Array.from(onlineUsers.keys()));

        // Join user's personal room
        socket.join(`user_${socket.userId}`);

        // Handle new message
        socket.on('send_message', async (data) => {
            try {
                const { recipientId, content } = data;

                // Emit to recipient if online
                io.to(`user_${recipientId}`).emit('new_message', {
                    id: Date.now(), // This should come from database
                    sender_id: socket.userId,
                    recipient_id: recipientId,
                    content,
                    created_at: new Date(),
                    is_read: false
                });

                // Confirm to sender
                socket.emit('message_sent', {
                    success: true,
                    recipientId,
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('message_error', {
                    error: 'Failed to send message'
                });
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { recipientId, isTyping } = data;
            io.to(`user_${recipientId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping
            });
        });

        // Handle mark as read
        socket.on('mark_read', (data) => {
            const { senderId } = data;
            io.to(`user_${senderId}`).emit('messages_read', {
                userId: socket.userId
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            onlineUsers.delete(socket.userId);
            io.emit('online_users', Array.from(onlineUsers.keys()));
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    getIO,
    emitToUser
};
