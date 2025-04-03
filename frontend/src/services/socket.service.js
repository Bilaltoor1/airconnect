import { io } from 'socket.io-client';

let socket = null;
let socketInitCount = 0; // Add counter to track initialization attempts

export const initializeSocket = (token) => {
    if (!token) {
        console.error('⛔ Socket init failed: No token provided');
        return null;
    }
    
    socketInitCount++;
    const currentAttempt = socketInitCount;
    console.log(`🔄 Socket initialization attempt #${currentAttempt}`);
    
    // If socket exists and is connected, don't recreate it
    if (socket && socket.connected) {
        console.log(`Socket already connected ✅ (attempt #${currentAttempt}), ID:`, socket.id);
        return socket;
    }
    
    // If socket exists but isn't connected, disconnect it properly first
    if (socket) {
        console.log(`Cleaning up existing socket connection (attempt #${currentAttempt})...`);
        try {
            socket.disconnect();
        } catch (e) {
            console.error('Error disconnecting socket:', e);
        }
        socket = null;
    }
    
    try {
        const socketUrl = import.meta.env.MODE === "development" 
            ? "http://localhost:3001" 
            : window.location.origin;
        
        console.log(`🔌 Connecting socket to ${socketUrl} (attempt #${currentAttempt})`);
        
        socket = io(socketUrl, {
            auth: { token },
            withCredentials: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 10000
        });
        
        // Add event listeners for connection events
        socket.on('connect', () => {
            console.log(`✅ Socket connected successfully! (attempt #${currentAttempt}) ID:`, socket.id);
        });
        
        socket.on('connect_error', (err) => {
            console.error(`❌ Socket connection error (attempt #${currentAttempt}):`, err.message);
        });
        
        socket.on('disconnect', (reason) => {
            console.log(`❌ Socket disconnected (attempt #${currentAttempt}). Reason:`, reason);
        });
        
        socket.on('error', (err) => {
            console.error(`❌ Socket error (attempt #${currentAttempt}):`, err);
        });
        
        return socket;
    } catch (err) {
        console.error(`❌ Error initializing socket (attempt #${currentAttempt}):`, err);
        return null;
    }
};

export const getSocket = () => {
    if (!socket) {
        console.warn('⚠️ Attempted to get socket but none exists');
    } else if (!socket.connected) {
        console.warn('⚠️ Socket exists but is not connected');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        console.log('🔌 Disconnecting socket...');
        try {
            socket.disconnect();
        } catch (e) {
            console.error('Error during socket disconnect:', e);
        }
        socket = null;
        console.log('✅ Socket disconnected');
    }
};

// Add a simple status check function for debugging
export const getSocketStatus = () => {
    if (!socket) return { status: 'not_initialized', id: null };
    return { 
        status: socket.connected ? 'connected' : 'disconnected', 
        id: socket.id,
        rooms: socket.rooms
    };
};
