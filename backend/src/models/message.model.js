import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String, // ✅ translated text (or original if no translation applied)
    },
    originalText: {
      type: String, // ✅ original message before translation
    },
    image: {
      type: String, // ✅ Cloudinary image URL
    },
  },
  { timestamps: true } // ✅ createdAt & updatedAt included
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
