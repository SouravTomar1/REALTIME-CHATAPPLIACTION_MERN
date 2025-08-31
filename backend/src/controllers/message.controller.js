import cloudinary from "../libs/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js"; // ✅ import your Message model
import { getReceiverSocketId } from "../libs/socket.js";
import { io } from "../libs/socket.js";
// Get users for sidebar (excluding yourself)
export const getuserforsidebar = async (req, res) => {
  try {
    const loggedUserID = req.user._id;

    const users = await User.find({ _id: { $ne: loggedUserID } }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getuserforsidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get chat messages between two users
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
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a message (with optional image upload)

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverID } = req.params;
    const senderID = req.user._id;
    console.log("Cloudinary config test:", cloudinary.config()); // <-- Debug log

    let imageUrl = null;

    // Upload image to Cloudinary if it exists
       if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image); // <-- This is where the error happens
      imageUrl = uploadResponse.secure_url;
    }

    // Create new message
    const newMessage = new Message({
      senderID,
      receiverID,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // You can emit with socket.io here (e.g. req.io.emit("newMessage", newMessage))
      const receiverSocketId=getReceiverSocketId(receiverID)
      {
        if(receiverSocketId){
          io.to(receiverSocketId).emit("newMessage",newMessage) //only send the ,essage to the reciever
        }
      }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
