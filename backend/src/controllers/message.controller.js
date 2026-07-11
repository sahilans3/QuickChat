import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { redisClient } from "../index.js";
import { pubClient } from "../lib/socket.js";

// ✅ USERS
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ GET MESSAGES (Redis cache with fallback)
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const chatKey = `chat:${[myId, userToChatId].sort().join(":")}`;

    if (redisClient.isReady) {
      try {
        const cachedMessages = await redisClient.get(chatKey);
        if (cachedMessages) {
          return res.status(200).json(JSON.parse(cachedMessages));
        }
      } catch (e) {
        console.error("Redis Cache Error:", e);
      }
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    if (redisClient.isReady) {
      try {
        await redisClient.set(chatKey, JSON.stringify(messages), { EX: 60 });
      } catch (e) {}
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ SEND MESSAGE (Redis Pub/Sub)
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // 🔥 Invalidate cache
    const chatKey = `chat:${[senderId, receiverId].sort().join(":")}`;
    if (redisClient.isReady) {
      try { await redisClient.del(chatKey); } catch(e) {}
    }

    // 🔥 Publish message or direct emit if Redis fails
    if (pubClient.isReady) {
      try {
        await pubClient.publish("chat", JSON.stringify(newMessage));
      } catch(e) {
        // Fallback to direct emit
        const receiverSocketId = await getReceiverSocketId(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    } else {
       // Fallback to direct emit
       const receiverSocketId = await getReceiverSocketId(receiverId);
       if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};