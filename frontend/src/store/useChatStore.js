import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isAiTyping: false,
  smartReplies: [],
  isFetchingSmartReplies: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      // Route to AI endpoint if the user is an AI
      const endpoint = selectedUser.isAI ? `/ai/message` : `/messages/send/${selectedUser._id}`;
      const res = await axiosInstance.post(endpoint, messageData);
      
      // The backend emits newMessage event for standard messages, but for AI we might get the immediate response back here.
      // To avoid duplicates if socket also emits, we just trust the socket, but for standard flow we append here.
      // Wait, standard flow appends here. Let's keep it.
      set({ messages: [...messages, res.data] });
      set({ smartReplies: [] }); // Clear smart replies on send
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to send message");
    }
  },

  fetchSmartReplies: async (lastMessage) => {
    if (!lastMessage) return;
    set({ isFetchingSmartReplies: true, smartReplies: [] });
    try {
      const res = await axiosInstance.post("/ai/smart-replies", { lastMessage });
      set({ smartReplies: res.data.replies || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch smart replies");
    } finally {
      set({ isFetchingSmartReplies: false });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      // Also check if we are sending to the AI and the AI responds
      const isAIResponse = selectedUser.isAI && newMessage.senderId === selectedUser._id;
      
      if (!isMessageSentFromSelectedUser && !isAIResponse) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("aiTyping", ({ isTyping }) => {
      set({ isAiTyping: isTyping });
    });

    socket.on("aiMessageError", (error) => {
      toast.error(error.message);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("aiTyping");
    socket.off("aiMessageError");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, smartReplies: [] }),
}));
