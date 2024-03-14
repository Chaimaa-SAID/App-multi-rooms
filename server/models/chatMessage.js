import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatMessageSchema = new mongoose.Schema(
   {
      _id: {
         type: String,
         default: () => uuidv4().replace(/\-/g, ""),
      },
      chatRoomId: String,
      message: mongoose.Schema.Types.Mixed,
      sender: String,
      receiver: String,
      content: String
   },
   {
      timestamps: true,
      collection: "chatmessages",
   }
);

const ChatMessageModel = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessageModel;