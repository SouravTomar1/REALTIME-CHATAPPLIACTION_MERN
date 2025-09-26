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

const MessageInput = ({ selectedUserId, selectedUserLanguage, isDark = true }) => {
  const [drafts, setDrafts] = useState({}); // Store draft per user
  const [showEmoji, setShowEmoji] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messageLanguage, setMessageLanguage] = useState(selectedUserLanguage || "en");

  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // Load draft when user changes
  useEffect(() => {
    setMessageLanguage(selectedUserLanguage || "en");
  }, [selectedUserLanguage]);

  const currentDraft = drafts[selectedUserId] || { text: "", image: null };
  const text = currentDraft.text;
  const imagePreview = currentDraft.image;

  const updateDraft = (newDraft) => {
    setDrafts((prev) => ({ ...prev, [selectedUserId]: { ...prev[selectedUserId], ...newDraft } }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => updateDraft({ image: reader.result });
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    updateDraft({ image: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      const isOnlyEmojis = /^[\p{Emoji}\s]+$/u.test(text.trim());

      const messageData = {
        text: text.trim(),
        image: imagePreview,
        targetLang: isOnlyEmojis ? null : messageLanguage,
        receiverId: selectedUserId,
      };

      await sendMessage(messageData);

      // Clear draft for this user
      updateDraft({ text: "", image: null });
      setShowEmoji(false);
      setShowLangMenu(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    updateDraft({ text: text + emojiObject.emoji });
    setShowEmoji(false);
  };

  return (
    <div className="p-3 w-full relative">
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-20 left-3 z-50 shadow-lg rounded-lg overflow-hidden">
          <Picker onEmojiClick={handleEmojiClick} theme={isDark ? "dark" : "light"} />
        </div>
      )}

      {/* Language Dropdown */}
      {showLangMenu && (
        <div className="absolute bottom-20 left-14 z-50 rounded-lg shadow-lg p-2 w-44 bg-base-200 dark:bg-base-300">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`block w-full text-left px-3 py-2 rounded-md hover:bg-base-300 dark:hover:bg-base-200 ${
                messageLanguage === lang.code ? "font-semibold bg-base-300 dark:bg-base-200" : ""
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

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-base-content"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center bg-base-300 dark:bg-base-200"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 py-2 bg-base-200 dark:bg-base-300">
          {/* Emoji Button */}
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => setShowEmoji((prev) => !prev)}
          >
            <Smile size={20} />
          </button>

          {/* Language Button */}
          <button
            type="button"
            className="relative btn btn-ghost btn-circle btn-sm"
            onClick={() => setShowLangMenu((prev) => !prev)}
          >
            <Globe size={18} />
            <span className="absolute -bottom-1 -right-1 text-[10px] px-1 rounded-full bg-blue-500 text-white">
              {messageLanguage.toUpperCase()}
            </span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => updateDraft({ text: e.target.value })}
            className="input input-bordered input-sm sm:input-md flex-1 rounded-full"
          />

          {/* Image Upload Button */}
          <button
            type="button"
            className={`btn btn-ghost btn-circle btn-sm ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        </div>

        {/* Send Button */}
        <button type="submit" className="btn btn-circle btn-sm" disabled={!text.trim() && !imagePreview}>
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
