import { useContext } from "react";
import { ChatContext } from "../context/chatContext.js";

export function useChat() {
  return useContext(ChatContext);
}
