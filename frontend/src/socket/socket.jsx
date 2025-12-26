import { io } from "socket.io-client";

const socket = io();

export const initSocket = () => {
    socket.on("connect", () => {});
    socket.on("disconnect", () => {});

    return socket;
};

export const socketAddListener = (listener = "", callback = () => {}) => {
    socket.on(listener, callback);
}

export const socketRemoveListener = (listener = "", callback = () => {}) => {
    socket.off(listener, callback);
}