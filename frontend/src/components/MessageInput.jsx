import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Wand2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { 
    sendMessage, 
    messages, 
    smartReplies, 
    fetchSmartReplies, 
    isFetchingSmartReplies 
  } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSmartReplyClick = (reply) => {
    setText(reply);
    // Alternatively, you could auto-send here by calling sendMessage directly
  };

  const handleFetchSmartReplies = () => {
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].text : null;
    if (lastMessage) {
      fetchSmartReplies(lastMessage);
    } else {
      toast.error("No message to reply to!");
    }
  };

  return (
    <div className="p-4 w-full bg-base-100/30 backdrop-blur-sm sticky bottom-0 flex flex-col gap-2">
      {/* Smart Replies Row */}
      {smartReplies.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSmartReplyClick(reply)}
              className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {imagePreview && (
        <div className="mb-1 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border border-base-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 shadow-sm
              flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-200 transition-colors"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex gap-2 items-center bg-base-200/50 rounded-full px-4 py-2 border border-base-300 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-base-content/40"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          
          <button
            type="button"
            onClick={handleFetchSmartReplies}
            disabled={isFetchingSmartReplies || messages.length === 0}
            className="hidden sm:flex items-center justify-center size-8 rounded-full text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            title="Suggest Smart Replies"
          >
            {isFetchingSmartReplies ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          </button>

          <button
            type="button"
            className={`hidden sm:flex items-center justify-center size-8 rounded-full transition-colors
                     ${imagePreview ? "text-primary bg-primary/10" : "text-base-content/40 hover:text-base-content hover:bg-base-300"}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
          >
            <Image size={18} />
          </button>
        </div>
        <button
          type="submit"
          className="size-11 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-content hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm shadow-primary/30"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} className="ml-1" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
