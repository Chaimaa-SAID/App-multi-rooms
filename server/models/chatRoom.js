import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    name: String,
  },
  {
    collection: "chatrooms",
  }
);

const ChatRoomModel = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoomModel;