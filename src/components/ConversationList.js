"use client";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import UserList from "./UserList";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../utils/socket";

export default function ConversationList({ userId, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/conversations/user", { 
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();

    socket.connect();
    socket.emit("addUser", userId);

    socket.on("getConversation", (conv) => {
      setConversations((prev) => [conv, ...prev]);
    });

    socket.on("getMessage", (msg) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === msg.conversationId
            ? { ...conv, lastMessage: msg }
            : conv
        )
      );
    });

    return () => {
      socket.off("getConversation");
      socket.off("getMessage");
    };
  }, [userId]);

  const handleStartChat = async (user) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data: newConv } = await api.post(
        "/conversations",
        { receiverId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("newConversation", newConv);
      onSelectConversation(newConv);
      setConversations((prev) => [newConv, ...prev]);
      setShowUsers(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    return sameDay
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      <button
        className="bg-[#25D366] text-white p-2 m-2 rounded-xl hover:bg-[#20b858] transition transform active:scale-95 shadow-md"
        onClick={() => setShowUsers((prev) => !prev)}
      >
        {showUsers ? "Hide Users" : "Start New Chat"}
      </button>

      <AnimatePresence>
        {showUsers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-y-auto p-2"
          >
            <UserList
              userId={userId}
              onStartChat={handleStartChat}
              conversations={conversations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 overflow-y-auto ${showUsers ? "mt-2" : ""} p-2`}>
        <AnimatePresence>
          {conversations.map((conv) => {
            const otherParticipants = (conv.participants || []).filter(
              (m) => m && m._id && m._id !== userId
            );
            if (otherParticipants.length === 0) return null;

            const displayName = otherParticipants
              .map((m) => m.username || "?")
              .join(", ");
            const avatarLetter = (
              otherParticipants[0]?.username?.[0] || "?"
            ).toUpperCase();

            const lastMsg = conv.lastMessage?.text || "";
            const lastTime =
              conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt;

            return (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer p-3 mb-2 bg-gray-50 rounded-xl shadow hover:bg-green-50 hover:scale-105 transition"
                onClick={() => onSelectConversation(conv)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#25D366] text-white font-bold rounded-full flex items-center justify-center">
                    {avatarLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="text-gray-800 font-medium truncate">
                        {displayName}
                      </div>
                      <div className="ml-auto text-xs text-gray-500">
                        {formatTime(lastTime)}
                      </div>
                    </div>
                    {lastMsg && (
                      <div className="text-xs text-gray-500 truncate">{lastMsg}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
