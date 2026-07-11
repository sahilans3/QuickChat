import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createClient } from "redis";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://quickchat-sable.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ---------------- REDIS SETUP ----------------

const pubClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

const subClient = pubClient.duplicate();

// ✅ Get socketId from Redis or memory fallback
const userSocketMap = new Map(); // Memory fallback if Redis fails

export async function getReceiverSocketId(userId) {
  const userIdStr = userId.toString();
  if (pubClient.isReady) {
    try {
      return await pubClient.get(`user:${userIdStr}`);
    } catch(e) { return userSocketMap.get(userIdStr); }
  }
  return userSocketMap.get(userIdStr);
}

// ---------------- SOCKET CONNECTION ----------------

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    if (pubClient.isReady) {
      try {
        await pubClient.set(`user:${userId}`, socket.id);
        await pubClient.sAdd("online_users", userId);
      } catch(e) { userSocketMap.set(userId, socket.id); }
    } else {
      userSocketMap.set(userId, socket.id);
    }
  }

  // send online users
  const getOnline = async () => {
    if (pubClient.isReady) {
      try {
         return await pubClient.sMembers("online_users");
      } catch(e) { return Array.from(userSocketMap.keys()); }
    }
    return Array.from(userSocketMap.keys());
  }
  
  io.emit("getOnlineUsers", await getOnline());

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);

    if (userId) {
      if (pubClient.isReady) {
        try {
          await pubClient.del(`user:${userId}`);
          await pubClient.sRem("online_users", userId);
        } catch(e) { userSocketMap.delete(userId); }
      } else {
        userSocketMap.delete(userId);
      }
    }

    io.emit("getOnlineUsers", await getOnline());
  });
});

// ---------------- REDIS PUB/SUB ----------------

export const initRedisSocket = async () => {
  try {
    await pubClient.connect();
    await subClient.connect();

    console.log("✅ Redis Pub/Sub Connected");

    await subClient.subscribe("chat", async (message) => {
      const parsed = JSON.parse(message);

      const receiverSocketId = await getReceiverSocketId(parsed.receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", parsed);
      }
    });

  } catch (error) {
    console.error(" Redis Socket Error:", error);
  }
};

// ------------------------------------------------

export { io, app, server, pubClient };