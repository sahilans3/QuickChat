import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { 
  generateReply, 
  generateReplyStream, 
  summarizeConversation, 
  generateSmartReplies, 
  analyzeImage 
} from "../services/gemini.service.js";
import cloudinary from "../lib/cloudinary.js";

const AI_ID = process.env.AI_USER_ID;

// Helper to fetch last 20 messages for context
const getRecentConversation = async (userId) => {
  return await Message.find({
    $or: [
      { senderId: userId, receiverId: AI_ID },
      { senderId: AI_ID, receiverId: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(20);
};

export const sendMessageToAI = async (req, res) => {
  try {
    const { text, image } = req.body;
    const senderId = req.user._id;

    if (!AI_ID) throw new Error("AI_USER_ID is not configured.");

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // 1. Save user's message
    const userMessage = new Message({
      senderId,
      receiverId: AI_ID,
      text,
      image: imageUrl,
    });
    await userMessage.save();

    // Return the user's message instantly so UI updates
    res.status(201).json(userMessage);

    // 2. Process AI Response in background
    (async () => {
      try {
        const receiverSocketId = await getReceiverSocketId(senderId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("aiTyping", { isTyping: true });
        }

        const history = await getRecentConversation(senderId);
        
        let aiResponseText;
        if (imageUrl && !text) {
            aiResponseText = await analyzeImage(image, "Describe this image.");
        } else if (imageUrl && text) {
            aiResponseText = await analyzeImage(image, text);
        } else {
            aiResponseText = await generateReply(history, text);
        }

        const aiMessage = new Message({
          senderId: AI_ID,
          receiverId: senderId,
          text: aiResponseText,
          isAIGenerated: true,
          status: 'complete'
        });
        await aiMessage.save();

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("aiTyping", { isTyping: false });
          io.to(receiverSocketId).emit("newMessage", aiMessage);
        }
      } catch (aiError) {
        console.error("Background AI Error:", aiError);
        const receiverSocketId = await getReceiverSocketId(senderId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("aiTyping", { isTyping: false });
          io.to(receiverSocketId).emit("aiMessageError", { message: "AI is temporarily unavailable." });
        }
      }
    })();
  } catch (error) {
    console.error("Error in sendMessageToAI:", error);
    res.status(500).json({ error: "Failed to send message to AI." });
  }
};

export const streamMessageFromAI = async (req, res) => {
  try {
    const { text } = req.body;
    const senderId = req.user._id;

    if (!text) return res.status(400).json({ error: "Text is required for streaming." });

    // Save user message
    const userMessage = new Message({
      senderId,
      receiverId: AI_ID,
      text,
    });
    await userMessage.save();

    const receiverSocketId = await getReceiverSocketId(senderId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", userMessage);
      io.to(receiverSocketId).emit("aiTyping", { isTyping: true });
    }

    // We will send chunks via SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const history = await getRecentConversation(senderId);
    const stream = generateReplyStream(history, text);

    let fullResponse = "";

    for await (const chunk of stream) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      
      if (receiverSocketId) {
         io.to(receiverSocketId).emit("aiMessageChunk", { chunk, conversationId: senderId });
      }
    }

    // Save final message
    const aiMessage = new Message({
      senderId: AI_ID,
      receiverId: senderId,
      text: fullResponse,
      isAIGenerated: true,
      status: 'complete'
    });
    await aiMessage.save();

    res.write(`data: ${JSON.stringify({ event: 'complete', message: aiMessage })}\n\n`);
    res.end();

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("aiTyping", { isTyping: false });
      io.to(receiverSocketId).emit("aiMessageComplete", aiMessage);
      // Also emit standard newMessage so normal UI updates
      io.to(receiverSocketId).emit("newMessage", aiMessage);
    }

  } catch (error) {
    console.error("Error in streamMessageFromAI:", error);
    res.write(`data: ${JSON.stringify({ error: "AI is temporarily unavailable." })}\n\n`);
    res.end();
  }
};

export const getSummarizeConversation = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }).limit(50); // Summarize last 50

    if (messages.length === 0) {
      return res.status(400).json({ summary: "No conversation history to summarize." });
    }

    const summary = await summarizeConversation(messages);
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in getSummarizeConversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSmartReplies = async (req, res) => {
  try {
    const { lastMessage } = req.body;
    if (!lastMessage) return res.status(400).json({ replies: [] });

    const replies = await generateSmartReplies(lastMessage);
    res.status(200).json({ replies });
  } catch (error) {
    console.error("Error in getSmartReplies:", error);
    res.status(500).json({ replies: [] });
  }
};
