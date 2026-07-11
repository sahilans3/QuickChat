import { MessageSquare, Sparkles } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/30">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4 relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
          <div className="relative">
            <div
              className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5"
            >
              <MessageSquare className="w-10 h-10 text-primary" />
              <div className="absolute -top-2 -right-2 bg-base-100 p-1.5 rounded-full shadow-sm border border-base-200">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-base-content">Welcome to Chatty</h2>
          <p className="text-base-content/60 text-sm">
            Select a conversation from the sidebar or start a new one to begin messaging.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
