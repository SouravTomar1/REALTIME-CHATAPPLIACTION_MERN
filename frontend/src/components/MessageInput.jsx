import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Globe, Smile } from "lucide-react";
import toast from "react-hot-toast";
import Picker from "emoji-picker-react";

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
  const [showLangMenu, setShowLangMenu] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const [messageLanguage, setMessageLanguage] = useState(selectedUserLanguage || "en");

  useEffect(() => {
    setMessageLanguage(selectedUserLanguage || "en");
  }, [selectedUserLanguage]);

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

 const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() && !imagePreview) return;

  try {
    // Detect if the message is only emojis (no normal letters/numbers)
    const isOnlyEmojis = /^[\p{Emoji}\s]+$/u.test(text.trim());

    await sendMessage({
      text: text.trim(),
      image: imagePreview,
      targetLang: isOnlyEmojis ? null : messageLanguage, // 🚀 Skip translation if only emojis
      receiverId: selectedUserId,
    });

    setText("");
    setImagePreview(null);
    setShowEmoji(false);
    setShowLangMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};


  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="p-3 w-full relative bg-gray-900 border-t border-gray-700 rounded-t-lg">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-16 left-3 z-50 shadow-lg rounded-lg overflow-hidden">
          <Picker onEmojiClick={handleEmojiClick} theme="dark" />
        </div>
      )}

      {/* Language Dropdown */}
      {showLangMenu && (
        <div className="absolute bottom-16 left-14 z-50 bg-gray-800 text-white rounded-lg shadow-lg p-2 w-44">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`block w-full text-left px-3 py-2 rounded-md hover:bg-gray-700 ${
                messageLanguage === lang.code ? "bg-gray-700 font-semibold" : ""
              }`}
              onClick={() => {
                setMessageLanguage(lang.code);
                setShowLangMenu(false);
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-gray-600"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-red-500 transition"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Message form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-full px-3 py-2">
          {/* Emoji button */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-700 transition text-white"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <Smile size={20} />
          </button>

          {/* Language selector */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-700 relative transition text-white"
            onClick={() => setShowLangMenu((prev) => !prev)}
          >
            <Globe size={18} />
            <span className="absolute -bottom-1 -right-1 text-[10px] bg-blue-600 text-white px-1 rounded-full">
              {messageLanguage.toUpperCase()}
            </span>
          </button>

          {/* Text input */}
          <input
            type="text"
            className="flex-1 bg-gray-800 text-white outline-none px-3 py-2 rounded-full placeholder-gray-400"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Image button */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-700 transition text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

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
          className={`p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white flex items-center justify-center ${
            !text.trim() && !imagePreview ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
