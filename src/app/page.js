"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/chatwindow";
import { socket } from "../utils/socket";
import "./globals.css";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [selectedConv, setSelectedConv] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      socket.emit("addUser", storedUserId);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
  localStorage.removeItem("token");
} catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("userId");
      router.push("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#128C7E] to-[#25D366] p-4">
      <div className="w-1/3 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="font-bold text-lg">Chats</h2>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <ConversationList
          userId={userId}
          onSelectConversation={setSelectedConv}
        />
      </div>

      <div className="flex-1 ml-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <ChatWindow conversation={selectedConv} userId={userId} />
      </div>
    </div>
  );
}
