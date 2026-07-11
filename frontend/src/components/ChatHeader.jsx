import { X, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id) || selectedUser.isAI;
  const initials = selectedUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="p-4 border-b border-base-300 bg-base-100/30 backdrop-blur-sm z-10 sticky top-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            {selectedUser.profilePic ? (
              <img
                src={selectedUser.profilePic}
                alt={selectedUser.fullName}
                className="size-10 object-cover rounded-xl"
              />
            ) : (
              <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm border
                ${selectedUser.isAI ? "bg-primary/20 text-primary border-primary/30" : "bg-primary/10 text-primary border-primary/20"}
              `}>
                {initials}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 size-3 rounded-full ring-2 ring-base-100 transition-colors
                ${isOnline ? "bg-success" : "bg-base-300"}
              `}
            />
          </div>

          {/* User info */}
          <div className="flex flex-col">
            <h3 className="font-semibold tracking-wide text-base-content flex items-center gap-1.5">
              {selectedUser.fullName}
              {selectedUser.isAI && <Sparkles className="w-3.5 h-3.5 text-primary" />}
            </h3>
            <p className="text-xs text-base-content/60">
              {selectedUser.isAI ? "AI Assistant" : (isOnline ? "Online" : "Offline")}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-xl text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
