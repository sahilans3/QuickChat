import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, User, LogOut } from "lucide-react";

const SidebarRail = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { icon: MessageSquare, label: "Chats", path: "/" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: User, label: "Profile", path: "/profile", requireAuth: true },
  ];

  return (
    <aside className="w-[72px] h-full bg-base-100 border-r border-base-300 flex flex-col items-center py-4 flex-shrink-0 z-50">
      <div className="mb-8">
        <Link to="/" className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
          <MessageSquare className="w-6 h-6 text-primary" />
        </Link>
      </div>

      <nav className="flex flex-col gap-4 flex-1 w-full items-center">
        {navItems.map((item) => {
          if (item.requireAuth && !authUser) return null;
          const isActive = location.pathname === item.path; 
          
          return (
            <Link
              key={item.label}
              to={item.path}
              title={item.label}
              className={`
                size-12 rounded-2xl flex items-center justify-center transition-all duration-200 group relative
                ${isActive ? "bg-primary text-primary-content shadow-lg shadow-primary/30" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"}
              `}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-14 bg-neutral text-neutral-content px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {authUser && (
        <button
          onClick={logout}
          title="Logout"
          className="size-12 rounded-2xl flex items-center justify-center text-base-content/60 hover:bg-error/10 hover:text-error transition-all duration-200 group relative mt-auto"
        >
          <LogOut className="w-6 h-6" />
          <span className="absolute left-14 bg-neutral text-neutral-content px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
            Logout
          </span>
        </button>
      )}
    </aside>
  );
};

export default SidebarRail;
