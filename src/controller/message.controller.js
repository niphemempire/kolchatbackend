import Conversation from "../../models/conversatio.model.js";
import Message from "../../models/message.model.js";

export const sendMessage = async (req, res) => {
    try {
        const {message} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;
       
       let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        })

        // await newMessage.save();
        // conversation.messages.push(newMessage._id);
        // await conversation.save();

        await Promise.all([
            newMessage.save(),
            Conversation.findByIdAndUpdate(conversation._id, { $push: { messages: newMessage._id } })
        ]);

        res.status(201).json({ message: "Message sent successfully", newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
       res.status(500).json({ Error: error.message || "Error occurred while sending message" }); 
    } 
}   

export const getMessage = async (req, res) => {

    try {
        const {id: userToChatId} = req.params;
        const senderId = req.user._id; 

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] }
        }).populate('messages');

        if (!conversation) {
            return res.status(200).json([]);
        }

        const unreadMessageIds = conversation.messages
            .filter((msg) => String(msg.receiverId) === String(senderId) && !msg.read)
            .map((msg) => msg._id);

        if (unreadMessageIds.length > 0) {
            await Message.updateMany({ _id: { $in: unreadMessageIds } }, { read: true });
        }

        const messages = conversation.messages.map((msg) => {
            const messageObject = msg.toObject ? msg.toObject() : { ...msg };
            if (String(messageObject.receiverId) === String(senderId) && !messageObject.read) {
                messageObject.read = true;
            }
            return messageObject;
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error retrieving message:", error);
       res.status(500).json({ Error: error.message || "Error occurred while retrieving message" }); 
    }
}

export const updateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message text is required." });
    }

    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, senderId },
      { message: message.trim(), edited: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found or unauthorized." });
    }

    res.status(200).json({ message: "Message updated successfully", updatedMessage });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ Error: error.message || "Error occurred while updating message" });
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const senderId = req.user._id;

    const deletedMessage = await Message.findOneAndUpdate(
      { _id: messageId, senderId },
      { deleted: true, message: "This message was deleted" },
      { new: true }
    );

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found or unauthorized." });
    }

    res.status(200).json({ message: "Message deleted successfully", deletedMessage });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ Error: error.message || "Error occurred while deleting message" });
  }
}
