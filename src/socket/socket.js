import jwt from "jsonwebtoken";
import { emitToUser } from "./socketEmitter.js";

function getTokenFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function setupSocket(io) {
    io.use((socket, next) => {
        try {
            const token = getTokenFromCookie(socket.handshake.headers.cookie);
            if (!token) {
                return next(new Error("Unauthorized"));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET?.trim());
            socket.userId = String(decoded.id);
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(`user:${socket.userId}`);
        console.log(`Socket connected: user ${socket.userId}`);

        socket.on("typing:start", ({ receiverId }) => {
            if (!receiverId) return;
            emitToUser(String(receiverId), "typing", {
                senderId: socket.userId,
                isTyping: true,
            });
        });

        socket.on("typing:stop", ({ receiverId }) => {
            if (!receiverId) return;
            emitToUser(String(receiverId), "typing", {
                senderId: socket.userId,
                isTyping: false,
            });
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: user ${socket.userId}`);
        });
    });
}
