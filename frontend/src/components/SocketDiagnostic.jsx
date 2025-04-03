import React, { useState, useEffect } from 'react';
import { getSocket, initializeSocket, disconnectSocket } from '../services/socket.service';
import axios from 'axios';

const SocketDiagnostic = () => {
    const [status, setStatus] = useState('Checking socket status...');
    const [socketId, setSocketId] = useState(null);
    const [connected, setConnected] = useState(false);
    const [serverStatus, setServerStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        checkSocketStatus();
        const interval = setInterval(checkSocketStatus, 5000);
        return () => clearInterval(interval);
    }, []);
    
    const checkSocketStatus = () => {
        const socket = getSocket();
        if (socket) {
            setSocketId(socket.id);
            setConnected(socket.connected);
            setStatus(socket.connected ? 'Connected' : 'Disconnected');
        } else {
            setSocketId(null);
            setConnected(false);
            setStatus('No socket initialized');
        }
    };
    
    const fetchServerStatus = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/debug/socket-status');
            setServerStatus(response.data);
        } catch (error) {
            console.error('Error fetching socket status:', error);
            setServerStatus({ error: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const reconnectSocket = () => {
        // Get token from cookies
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };
        
        const token = getCookie('token');
        
        if (token) {
            disconnectSocket();
            const socket = initializeSocket(token);
            if (socket) {
                checkSocketStatus();
            }
        } else {
            setStatus('No auth token found');
        }
    };
    
    const sendTestNotification = async () => {
        setLoading(true);
        try {
            // Get current user ID from localStorage or context
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user._id) {
                setStatus('Unable to find user ID');
                return;
            }
            
            const response = await axios.post('/api/debug/send-test-notification', {
                userId: user._id
            });
            alert(`Test notification sent! ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.error('Error sending test notification:', error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Socket Diagnostic</h2>
            
            <div className="mb-4">
                <p className="mb-2"><strong>Status:</strong> <span className={connected ? "text-green-600" : "text-red-600"}>{status}</span></p>
                <p className="mb-2"><strong>Socket ID:</strong> {socketId || 'None'}</p>
            </div>
            
            <div className="flex space-x-2 mb-4">
                <button 
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={reconnectSocket}
                >
                    Reconnect Socket
                </button>
                <button 
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={fetchServerStatus}
                    disabled={loading}
                >
                    Check Server Status
                </button>
                <button 
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    onClick={sendTestNotification}
                    disabled={loading || !connected}
                >
                    Send Test Notification
                </button>
            </div>
            
            {loading && <p>Loading...</p>}
            
            {serverStatus && (
                <div className="mt-4 border-t pt-4">
                    <h3 className="text-md font-semibold mb-2">Server Socket Status</h3>
                    <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60 text-xs">
                        {JSON.stringify(serverStatus, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default SocketDiagnostic;
