import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD to track daily usage
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
  }
});

// TTL index to automatically delete old usage records after 24 hours
aiUsageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Compound index to ensure one record per user per day
aiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

const AiUsage = mongoose.model("AiUsage", aiUsageSchema);
export default AiUsage;
