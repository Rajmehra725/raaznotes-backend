import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js"; // for media uploads

// 📨 Send message (text / image / video / voice)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    // Check or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // 📸 Upload media if exists
    let mediaUrls = [];
    if (req.files && req.files.media) {
      for (const file of req.files.media) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "messages",
          resource_type: "auto",
        });
        mediaUrls.push(upload.secure_url);
      }
    }

    // 🎙️ Upload voice note if exists
    let voiceNoteUrl = "";
    if (req.files && req.files.voiceNote) {
      const upload = await cloudinary.uploader.upload(
        req.files.voiceNote[0].path,
        {
          folder: "voiceNotes",
          resource_type: "auto",
        }
      );
      voiceNoteUrl = upload.secure_url;
    }

    // 💬 Create new message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      receiver: receiverId,
      text,
      media: mediaUrls,
      voiceNote: voiceNoteUrl,
    });

    // Update conversation info
    conversation.lastMessage = message._id;
    if (!conversation.unseenCount.get(receiverId.toString())) {
      conversation.unseenCount.set(receiverId.toString(), 0);
    }
    conversation.unseenCount.set(
      receiverId.toString(),
      conversation.unseenCount.get(receiverId.toString()) + 1
    );
    await conversation.save();

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Send message failed", error: error.message });
  }
};

// 💬 Get all messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // receiverId
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userId] },
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const messages = await Message.find({ conversationId: conversation._id })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to get messages", error: error.message });
  }
};

// 👁️ Mark messages as seen
export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { conversationId, receiver: userId, isSeen: false },
      { isSeen: true }
    );

    const convo = await Conversation.findById(conversationId);
    if (convo) {
      convo.unseenCount.set(userId.toString(), 0);
      await convo.save();
    }

    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as seen", error: error.message });
  }
};

// ❤️ React to a message (like ❤️, 😂, 👍, etc.)
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Check if user already reacted
    const existing = message.reactions.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existing) existing.emoji = emoji;
    else message.reactions.push({ emoji, user: userId });

    await message.save();
    res.json({ message: "Reaction added", data: message });
  } catch (error) {
    res.status(500).json({ message: "Failed to react", error: error.message });
  }
};

// 🗑️ Delete message (for me / for everyone)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { forEveryone } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (forEveryone) {
      await message.deleteOne();
      res.json({ message: "Message deleted for everyone" });
    } else {
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
      res.json({ message: "Message deleted for you" });
    }
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
