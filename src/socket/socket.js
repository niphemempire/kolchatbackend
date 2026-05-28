import jwt from "jsonwebtoken";
import { emitToUser } from "./socketEmitter.js";

// Track online users: userId -> Set of socket IDs (supports multiple tabs/devices)
const userSockets = new Map();

function getTokenFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function getOnlineUserIds() {
    return Array.from(userSockets.keys());
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
        const userId = socket.userId;
        socket.join(`user:${userId}`);

        // Track this socket for the user
        const wasOffline = !userSockets.has(userId);
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);

        console.log(`Socket connected: user ${userId} (${userSockets.get(userId).size} active)`);

        // If user just came online (first socket), broadcast to everyone else
        if (wasOffline) {
            socket.broadcast.emit("user:online", { userId });
        }

        // Send the connecting client the full list of currently-online users
        socket.emit("user:onlineUsers", { userIds: getOnlineUserIds() });

        // Allow clients to request the online list at any time
        socket.on("user:getOnlineUsers", () => {
            socket.emit("user:onlineUsers", { userIds: getOnlineUserIds() });
        });

        socket.on("typing:start", ({ receiverId }) => {
            if (!receiverId) return;
            emitToUser(String(receiverId), "typing", {
                senderId: userId,
                isTyping: true,
            });
        });

        socket.on("typing:stop", ({ receiverId }) => {
            if (!receiverId) return;
            emitToUser(String(receiverId), "typing", {
                senderId: userId,
                isTyping: false,
            });
        });

        socket.on("message:markRead", async ({ messageId }) => {
            if (!messageId) return;
            try {
                // Dynamically import the model to avoid top-level cyclic issues if any
                const Message = (await import("../../models/message.model.js")).default;
                const msg = await Message.findOneAndUpdate(
                    { _id: messageId, receiverId: userId, read: false },
                    { read: true },
                    { new: true }
                );
                if (msg) {
                    emitToUser(String(msg.senderId), "messagesRead", {
                        readerId: userId,
                        messageIds: [String(msg._id)],
                    });
                }
            } catch (error) {
                console.error("Error marking message as read via socket:", error);
            }
        });

        socket.on("disconnect", () => {
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                    // User fully offline — broadcast to everyone
                    io.emit("user:offline", { userId });
                    console.log(`Socket disconnected: user ${userId} (now offline)`);
                } else {
                    console.log(`Socket disconnected: user ${userId} (${sockets.size} remaining)`);
                }
            }
        });
    });
}
