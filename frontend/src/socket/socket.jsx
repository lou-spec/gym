import { io } from "socket.io-client";
import { socketBaseUrl } from "../config/config";

const socket = io(socketBaseUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
});

export const initSocket = () => {
    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });
    socket.on("connect_error", (err) => {
        console.log("Socket connection error:", err.message);
    });

    return socket;
};

export const socketAddListener = (listener = "", callback = () => { }) => {
    socket.on(listener, callback);
}

export const socketRemoveListener = (listener = "", callback = () => { }) => {
    socket.off(listener, callback);
}