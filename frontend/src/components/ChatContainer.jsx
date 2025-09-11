import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../libs/utils.js";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    // Typing indicator
    socket.on("typing", ({ sender }) => setTypingUser(sender));
    socket.on("stopTyping", () => setTypingUser(null));

    socket.on("messageStatusUpdated", ({ messageId, status }) => {
      getMessages(selectedUser._id);
    });

    socket.on("reactionAdded", ({ messageId }) => {
      getMessages(selectedUser._id);
    });

    return () => {
      unsubscribeFromMessages();
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageStatusUpdated");
      socket.off("reactionAdded");
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, socket]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      requestAnimationFrame(() => {
        messageEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput selectedUserId={selectedUser?._id} selectedUserLanguage={selectedUser?.language} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderID === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderID === authUser._id ? authUser.profilePic || "/jokerimage.png" : selectedUser.profilePic || "/batman.png"}
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble relative group">
              {message.image && (
                <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2" />
              )}

              {message.text && (
                <p className="font-semibold relative cursor-pointer">
                  {message.text}
                  {/* Message Status */}
                  {message.senderID === authUser._id && (
                    <span className="ml-1">
                      {message.status === "sent" && " ✅"}
                      {message.status === "delivered" && " ✅✅"}
                      {message.status === "read" && " 🔵"}
                    </span>
                  )}

                  {/* Tooltip for original text */}
                  {message.originalText && message.originalText !== message.text && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-nowrap">
                      {message.originalText}
                    </span>
                  )}

                  {/* Reactions */}
                  {message.reactions?.length > 0 && (
                    <div className="flex space-x-1 mt-1">
                      {message.reactions.map((r, idx) => (
                        <span key={idx}>{r.reaction}</span>
                      ))}
                    </div>
                  )}
                </p>
              )}
            </div>
          </div>
        ))}
        {typingUser && (
          <div className="text-sm text-gray-400 px-4 pb-2">{typingUser} is typing...</div>
        )}
      </div>

      <MessageInput selectedUserId={selectedUser?._id} selectedUserLanguage={selectedUser?.language} />
    </div>
  );
};

export default ChatContainer;
