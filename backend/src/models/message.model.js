import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'complete', 'error'],
      default: 'complete', // For normal messages, it's complete right away. AI might be pending if streaming.
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
