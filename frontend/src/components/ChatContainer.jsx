import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isAiTyping,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && (messages || isAiTyping)) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiTyping]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-base-100">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-base-100 relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-base-300">
        {messages.map((message) => {
          const isSentByMe = message.senderId === authUser._id;
          const user = isSentByMe ? authUser : selectedUser;
          const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          return (
            <div
              key={message._id}
              className={`chat ${isSentByMe ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-8 rounded-xl shadow-sm">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="profile pic" />
                  ) : (
                    <div className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs border
                      ${user.isAI ? "bg-primary/20 text-primary border-primary/30" : "bg-primary/10 text-primary border-primary/20"}
                    `}>
                      {initials}
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-header mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-base-content/80 flex items-center gap-1">
                  {user.fullName}
                  {user.isAI && <Sparkles className="w-3 h-3 text-primary" />}
                </span>
                <time className="text-[11px] font-medium text-base-content/40">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div 
                className={`chat-bubble flex flex-col shadow-sm rounded-2xl px-4 py-2.5 ${
                  isSentByMe ? "bg-primary text-primary-content" : (user.isAI ? "bg-primary/5 border border-primary/10 text-base-content" : "bg-base-200 text-base-content")
                }`}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-xl mb-2 object-cover"
                  />
                )}
                {message.text && <p className="text-[15px] leading-relaxed">{message.text}</p>}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isAiTyping && selectedUser.isAI && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-8 rounded-xl shadow-sm bg-primary/20 text-primary border-primary/30 flex items-center justify-center font-bold text-xs">
                {selectedUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="chat-header mb-1.5 flex items-center gap-2">
              <span className="text-sm font-medium text-base-content/80 flex items-center gap-1">
                {selectedUser.fullName}
                <Sparkles className="w-3 h-3 text-primary" />
              </span>
            </div>
            <div className="chat-bubble flex items-center gap-1.5 shadow-sm rounded-2xl px-4 py-3.5 bg-primary/5 border border-primary/10 w-fit">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messageEndRef}></div>
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
