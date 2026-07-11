import AiUsage from "../models/aiUsage.model.js";

const MAX_DAILY_AI_REQUESTS = 50;

export const aiRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Find or create usage record
    let usage = await AiUsage.findOne({ userId, date: today });
    
    if (!usage) {
      usage = new AiUsage({ userId, date: today, count: 1 });
      await usage.save();
      return next();
    }

    if (usage.count >= MAX_DAILY_AI_REQUESTS) {
      return res.status(429).json({ 
        message: "You have reached your daily limit of 50 AI messages. Please try again tomorrow." 
      });
    }

    usage.count += 1;
    await usage.save();
    next();
  } catch (error) {
    console.error("Error in AI rate limiter:", error.message);
    // Fail open in case of DB errors so we don't completely break the app
    next();
  }
};
