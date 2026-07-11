const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-base-100 scrollbar-thin scrollbar-thumb-base-300">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
          <div className="chat-image avatar">
            <div className="size-8 rounded-xl shadow-sm">
              <div className="skeleton w-full h-full rounded-xl" />
            </div>
          </div>

          <div className="chat-header mb-1.5 flex items-center gap-2">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-12" />
          </div>

          <div className="chat-bubble bg-transparent p-0">
            <div className="skeleton h-16 w-[200px] sm:w-[250px] rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
