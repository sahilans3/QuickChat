import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Search, Sparkles } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnline;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100/50">
      <div className="border-b border-base-300 w-full p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg hidden lg:block tracking-wide">Messages</h2>
          <label className="cursor-pointer flex items-center gap-2 hidden lg:flex group">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="toggle toggle-primary toggle-sm"
            />
            <span className="text-xs text-base-content/60 group-hover:text-base-content transition-colors">Online Only</span>
          </label>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-base-content/40" />
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-base-200/50 border border-base-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 flex-1 scrollbar-thin scrollbar-thumb-base-300">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id) || user.isAI; // AI is always online
          const isSelected = selectedUser?._id === user._id;

          // Generate initials for avatar fallback
          const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-4 relative group
                transition-all duration-200 ease-in-out
                ${isSelected ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
            >
              {/* Left Accent Bar for Selected State */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}

              <div className="relative mx-auto lg:mx-0 flex-shrink-0">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-2xl"
                  />
                ) : (
                  <div className={`size-12 rounded-2xl flex items-center justify-center font-bold text-lg border
                    ${user.isAI ? "bg-primary/20 text-primary border-primary/30" : "bg-primary/10 text-primary border-primary/20"}
                  `}>
                    {initials}
                  </div>
                )}
                
                {/* Status Dot Overlay */}
                <span
                  className={`absolute -bottom-1 -right-1 size-3.5 rounded-full ring-2 ring-base-100 transition-colors
                    ${isOnline ? "bg-success" : "bg-base-300"}
                  `}
                />
              </div>

              {/* User info */}
              <div className="hidden lg:flex flex-col items-start min-w-0 flex-1">
                <div className="flex justify-between w-full items-center mb-0.5">
                  <span className={`font-medium truncate ${isSelected ? "text-base-content" : "text-base-content/90"}`}>
                    {user.fullName}
                  </span>
                  {user.isAI && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                      <Sparkles className="w-3 h-3" />
                      Bot
                    </span>
                  )}
                </div>
                <div className="text-xs text-base-content/50 truncate w-full text-left">
                  {user.isAI ? "AI Assistant" : (isOnline ? "Online" : "Offline")}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/50 py-8 px-4 text-sm">
            No contacts found.
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
