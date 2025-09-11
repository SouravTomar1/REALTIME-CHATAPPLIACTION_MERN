import cloudinary from "../libs/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../libs/socket.js";
import { translateText } from "../libs/translate.js";

// Get users excluding logged-in user
export const getuserforsidebar = async (req, res) => {
  try {
    const loggedUserID = req.user._id;
    const users = await User.find({ _id: { $ne: loggedUserID } }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("getuserforsidebar error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatID } = req.params;
    const myID = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderID: myID, receiverID: userToChatID },
        { senderID: userToChatID, receiverID: myID }
      ]
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message (text + optional image + translation)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, targetLang } = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user._id;

    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Default to original text
    let translatedText = text;

    // Skip translation if:
    // 1. Only emojis, OR
    // 2. Target language is English ("en"), OR
    // 3. No targetLang provided
    if (
      text &&
      targetLang &&
      targetLang !== "en" &&
      !/^[\p{Emoji}\s]+$/u.test(text)
    ) {
      translatedText = await translateText(text, targetLang);
    }

    const newMessage = new Message({
      senderID,
      receiverID,
      text: translatedText,
      originalText: text,
      image: imageUrl,
      status: "sent", // ✅ default
    });

    await newMessage.save();

    // Emit to receiver (real-time)
    const receiverSocketId = getReceiverSocketId(receiverID);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Update message status (delivered / read)
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body; // "delivered" | "read"

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Message not found" });

    // Emit to sender
    const senderSocketId = getReceiverSocketId(updated.senderID);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdated", {
        messageId,
        status,
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("updateMessageStatus error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Add reaction to a message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body; // 👍 ❤️ 😂
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    msg.reactions.push({ userId, reaction });
    await msg.save();

    // Emit to both sender & receiver
    const senderSocketId = getReceiverSocketId(msg.senderID);
    const receiverSocketId = getReceiverSocketId(msg.receiverID);

    [senderSocketId, receiverSocketId].forEach((sock) => {
      if (sock) {
        io.to(sock).emit("reactionAdded", {
          messageId,
          reaction,
          userId,
        });
      }
    });

    res.json(msg);
  } catch (error) {
    console.error("addReaction error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
