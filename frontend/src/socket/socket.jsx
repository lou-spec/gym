import { io } from "socket.io-client";
import { socketBaseUrl } from "../config/config";

console.log('Socket connecting to:', socketBaseUrl);

const socket = io(socketBaseUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
});

let initialized = false;

export const initSocket = () => {
    if (initialized) return socket;

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === 'io server disconnect') {
            socket.connect();
        }
    });

    socket.on("connect_error", (err) => {
        console.log("Socket connection error:", err.message);
    });

    socket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
        console.log("Socket reconnecting... attempt", attemptNumber);
    });

    if (!socket.connected) {
        socket.connect();
    }

    initialized = true;
    return socket;
};

export const socketAddListener = (listener = "", callback = () => { }) => {
    socket.on(listener, callback);
}

export const socketRemoveListener = (listener = "", callback = () => { }) => {
    socket.off(listener, callback);
}

export const getSocket = () => socket;
export const isConnected = () => socket.connected;