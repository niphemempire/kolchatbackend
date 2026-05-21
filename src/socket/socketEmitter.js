let io = null;

export function setSocketIO(socketIO) {
    io = socketIO;
}

export function getSocketIO() {
    return io;
}

export function emitToUser(userId, event, payload) {
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit(event, payload);
}

export function serializeMessage(message) {
    const doc = message.toObject ? message.toObject() : message;
    return {
        _id: doc._id,
        senderId: doc.senderId,
        receiverId: doc.receiverId,
        message: doc.message,
        read: doc.read ?? false,
        edited: doc.edited ?? false,
        deleted: doc.deleted ?? false,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
