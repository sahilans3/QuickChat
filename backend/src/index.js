import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import { app, server } from "./lib/socket.js";
import { createClient } from "redis";
import { initRedisSocket } from "./lib/socket.js";
import User from "./models/user.model.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// ✅ Redis setup (ADD THIS)
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("❌ Failed to connect to Redis. Running without it.");
  }
};

// ----------------------------

const allowedOrigins = [
  "http://localhost:5173",
  "https://quickchat-sable.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

const seedAIUser = async () => {
  const AI_ID = process.env.AI_USER_ID;
  if (!AI_ID) return;
  
  try {
    const existingAI = await User.findById(AI_ID);
    if (!existingAI) {
      const aiUser = new User({
        _id: AI_ID,
        email: "ai@chatty.internal",
        fullName: "Chatty AI",
        password: "internal_ai_password_hash",
        profilePic: "https://ui-avatars.com/api/?name=Chatty+AI&background=5865F2&color=fff",
        isAI: true,
      });
      await aiUser.save();
      console.log("✅ Seeded AI User");
    }
  } catch (error) {
    console.error("❌ Failed to seed AI user:", error);
  }
};

// ✅ Proper startup
const startServer = async () => {
  try {
    await connectRedis();   
    await connectDB();      
    await initRedisSocket();
    await seedAIUser();
    
    server.listen(PORT, () => {
      console.log("🚀 Server running on PORT: " + PORT);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { redisClient };