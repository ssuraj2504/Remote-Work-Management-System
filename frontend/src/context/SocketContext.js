import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        // Create socket connection
        const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        newSocket.on('online_users', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnected(false);
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            newSocket.close();
        };
    }, []);

    const value = {
        socket,
        connected,
        onlineUsers,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
