import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { aiRateLimiter } from "../middleware/aiRateLimit.js";
import {
  sendMessageToAI,
  streamMessageFromAI,
  getSummarizeConversation,
  getSmartReplies,
} from "../controllers/ai.controller.js";

const router = express.Router();

// Apply auth and rate limiter to all AI routes
router.use(protectRoute);
router.use(aiRateLimiter);

router.post("/message", sendMessageToAI);
router.post("/message/stream", streamMessageFromAI);
router.post("/summarize", getSummarizeConversation);
router.post("/smart-replies", getSmartReplies);

export default router;
