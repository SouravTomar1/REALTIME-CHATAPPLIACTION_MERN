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

    // Translate message if targetLang provided
    let translatedText = text;
    if (text && targetLang) {
      translatedText = await translateText(text, targetLang);
    }

    const newMessage = new Message({
      senderID,
      receiverID,
      text: translatedText,
      originalText: text,  // save original
      image: imageUrl,
    });

    await newMessage.save();

    // Emit to receiver
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
