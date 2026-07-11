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

// ✅ Get socketId from Redis
export async function getReceiverSocketId(userId) {
  return await pubClient.get(`user:${userId}`);
}

// ---------------- SOCKET CONNECTION ----------------

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    // store mapping
    await pubClient.set(`user:${userId}`, socket.id);
    await pubClient.sAdd("online_users", userId);
  }

  // send online users
  const onlineUsers = await pubClient.sMembers("online_users");
  io.emit("getOnlineUsers", onlineUsers);

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);

    if (userId) {
      await pubClient.del(`user:${userId}`);
      await pubClient.sRem("online_users", userId);
    }

    const updatedUsers = await pubClient.sMembers("online_users");
    io.emit("getOnlineUsers", updatedUsers);
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