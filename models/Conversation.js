import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    unseenCount: {
      type: Map,
      of: Number, // userId -> unseen message count
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
