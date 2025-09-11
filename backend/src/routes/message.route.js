import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getuserforsidebar,
  getMessages,
  sendMessage,
  updateMessageStatus,
  addReaction,
} from "../controllers/message.controller.js";

const router = express.Router();

// Get all users (except logged-in)
router.get("/users", protectRoute, getuserforsidebar);

// Get messages with a user
router.get("/:id", protectRoute, getMessages);

// Send a message
router.post("/send/:id", protectRoute, sendMessage);

// Update message status (delivered/read)
router.patch("/status/:messageId", protectRoute, updateMessageStatus);

// Add reaction to a message
router.post("/reaction/:messageId", protectRoute, addReaction);

export default router;
