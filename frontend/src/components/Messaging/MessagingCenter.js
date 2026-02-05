import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiSearch, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import '../../styles/Messaging.css';

const MessagingCenter = () => {
    const { user } = useAuth();
    const { socket, onlineUsers, connected } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new_message', handleNewMessage);
            socket.on('user_typing', handleTyping);
            socket.on('messages_read', handleMessagesRead);

            return () => {
                socket.off('new_message');
                socket.off('user_typing');
                socket.off('messages_read');
            };
        }
    }, [socket, selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await messageAPI.getConversations();
            setConversations(res.data.conversations);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await messageAPI.getAllUsers();
            setAllUsers(res.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const res = await messageAPI.getMessages(otherUserId);
            setMessages(res.data.messages);

            // Mark as read
            await messageAPI.markAsRead(otherUserId);
            if (socket) {
                socket.emit('mark_read', { senderId: otherUserId });
            }

            // Update conversation unread count
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === otherUserId ? { ...conv, unread_count: 0 } : conv
                )
            );
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setShowNewChat(false);
        fetchMessages(conversation.id);
    };

    const handleNewMessage = (message) => {
        if (selectedConversation && message.sender_id === selectedConversation.id) {
            setMessages(prev => [...prev, message]);

            // Mark as read immediately
            messageAPI.markAsRead(selectedConversation.id);
            socket.emit('mark_read', { senderId: selectedConversation.id });
        } else {
            // Update conversation list with unread count
            fetchConversations();
            toast.success('New message received');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const res = await messageAPI.sendMessage(selectedConversation.id, newMessage);
            const message = res.data.message;

            setMessages(prev => [...prev, message]);
            setNewMessage('');

            // Emit via socket
            if (socket) {
                socket.emit('send_message', {
                    recipientId: selectedConversation.id,
                    content: newMessage
                });
            }

            // Update conversation list
            fetchConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleTyping = (data) => {
        if (data.isTyping) {
            setTypingUsers(prev => new Set(prev).add(data.userId));
        } else {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        }
    };

    const handleMessagesRead = (data) => {
        // Update messages to read status
        setMessages(prev =>
            prev.map(msg =>
                msg.recipient_id === data.userId ? { ...msg, is_read: true } : msg
            )
        );
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        if (socket && selectedConversation) {
            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Emit typing
            socket.emit('typing', { recipientId: selectedConversation.id, isTyping: true });

            // Stop typing after 2 seconds
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { recipientId: selectedConversation.id, isTyping: false });
            }, 2000);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const isUserOnline = (userId) => onlineUsers.includes(userId);

    const filteredUsers = allUsers.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredConversations = conversations.filter(c =>
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-content">
                <Sidebar role={user.role} />
                <main className="main-content">
                    <div className="page-header">
                        <div>
                            <h1>Messages</h1>
                            <p>
                                {connected ? (
                                    <span style={{ color: '#10b981' }}>● Connected</span>
                                ) : (
                                    <span style={{ color: '#ef4444' }}>● Offline</span>
                                )}
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowNewChat(!showNewChat)}
                        >
                            <FiMessageSquare /> New Chat
                        </button>
                    </div>

                    <div className="messaging-container">
                        {/* Conversations List */}
                        <div className="conversations-panel">
                            <div className="search-box">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="loading-conversations">Loading...</div>
                            ) : (
                                <div className="conversations-list">
                                    {filteredConversations.map((conv) => (
                                        <motion.div
                                            key={conv.id}
                                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''
                                                }`}
                                            onClick={() => handleSelectConversation(conv)}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="conversation-avatar">
                                                <div className="avatar-circle">
                                                    {conv.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                {isUserOnline(conv.id) && (
                                                    <BsCircleFill className="online-indicator" />
                                                )}
                                            </div>
                                            <div className="conversation-info">
                                                <div className="conversation-header">
                                                    <h4>{conv.full_name}</h4>
                                                    {conv.unread_count > 0 && (
                                                        <span className="unread-badge">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="last-message">
                                                    {conv.last_message
                                                        ? conv.last_message.substring(0, 40) + '...'
                                                        : 'No messages yet'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {filteredConversations.length === 0 && (
                                        <div className="empty-conversations">
                                            <FiMessageSquare size={48} />
                                            <p>No conversations yet</p>
                                            <button
                                                className="btn btn-primary btn-small"
                                                onClick={() => setShowNewChat(true)}
                                            >
                                                Start a conversation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Chat Window */}
                        <div className="chat-panel">
                            {showNewChat ? (
                                <div className="new-chat-panel">
                                    <h3>
                                        <FiUsers /> Start New Conversation
                                    </h3>
                                    <div className="users-list">
                                        {filteredUsers.map((u) => (
                                            <motion.div
                                                key={u.id}
                                                className="user-item"
                                                onClick={() => {
                                                    handleSelectConversation(u);
                                                }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <div className="user-avatar">
                                                    {u.full_name.charAt(0).toUpperCase()}
                                                    {isUserOnline(u.id) && (
                                                        <BsCircleFill className="online-indicator" />
                                                    )}
                                                </div>
                                                <div className="user-info">
                                                    <h4>{u.full_name}</h4>
                                                    <p>{u.email}</p>
                                                    <span className={`role-badge role-${u.role}`}>
                                                        {u.role}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedConversation ? (
                                <>
                                    <div className="chat-header">
                                        <div className="chat-user-info">
                                            <div className="chat-avatar">
                                                {selectedConversation.full_name.charAt(0).toUpperCase()}
                                                {isUserOnline(selectedConversation.id) && (
                                                    <BsCircleFill className="online-indicator" />
                                                )}
                                            </div>
                                            <div>
                                                <h3>{selectedConversation.full_name}</h3>
                                                <p>
                                                    {isUserOnline(selectedConversation.id)
                                                        ? 'Online'
                                                        : 'Offline'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="messages-container">
                                        <AnimatePresence>
                                            {messages.map((msg, index) => (
                                                <motion.div
                                                    key={msg.id || index}
                                                    className={`message ${msg.sender_id === user.id ? 'sent' : 'received'
                                                        }`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="message-content">{msg.content}</div>
                                                    <div className="message-time">
                                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                        {msg.sender_id === user.id && (
                                                            <span className="read-status">
                                                                {msg.is_read ? '✓✓' : '✓'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {typingUsers.has(selectedConversation.id) && (
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form className="message-input-container" onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            disabled={!connected}
                                        />
                                        <button type="submit" className="send-button" disabled={!newMessage.trim() || !connected}>
                                            <FiSend />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="no-conversation-selected">
                                    <FiMessageSquare size={64} />
                                    <h3>Select a conversation</h3>
                                    <p>Choose a conversation from the list or start a new one</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MessagingCenter;
