import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import Picker from "emoji-picker-react";

// Available languages (ISO codes)
const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
];

const MessageInput = ({ selectedUserId, selectedUserLanguage }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // ✅ Default to receiver's language if available, otherwise English
  const [messageLanguage, setMessageLanguage] = useState(selectedUserLanguage || "en");

  useEffect(() => {
    setMessageLanguage(selectedUserLanguage || "en");
  }, [selectedUserLanguage]);

  // Image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        targetLang: messageLanguage, // ✅ language from dropdown
        receiverId: selectedUserId,
      });
      setText("");
      setImagePreview(null);
      setShowEmoji(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Emoji selection
  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="p-4 w-full relative">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-16 left-4 z-50">
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Message form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 items-center">
          {/* Emoji button */}
          <button
            type="button"
            className="btn btn-circle text-zinc-400"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            😊
          </button>

          {/* Text input */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Language Dropdown */}
          <select
            className="select select-bordered select-sm"
            value={messageLanguage}
            onChange={(e) => setMessageLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Image button */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
