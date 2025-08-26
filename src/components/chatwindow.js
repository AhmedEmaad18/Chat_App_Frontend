"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../utils/api";
import { socket } from "../utils/socket";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FiPaperclip, FiSend } from "react-icons/fi";

export default function ChatWindow({ conversation, userId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversation._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [conversation?._id]);

  useEffect(() => {
    socket.connect();
    socket.emit("addUser", userId);

    socket.on("getMessage", (msg) => {
      if (msg.conversationId === conversation?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("getMessage");
  }, [userId, conversation?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text && !image) return;
    if (!conversation || !conversation.participants) return;

    const receiver = conversation.participants.find((m) => m._id !== userId);
    if (!receiver) return;

    const formData = new FormData();
    formData.append("senderId", userId);
    formData.append("receiverId", receiver._id);
    formData.append("conversationId", conversation._id);
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      const { data } = await api.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [...prev, data]);
      setText("");
      setImage(null);

      socket.emit("sendMessage", data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );
  }

  const receiver = conversation.participants.find((m) => m._id !== userId);
  const displayName = receiver?.username || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return  (
    <div className="flex-1 flex flex-col h-full bg-gray-50 rounded-2xl">
      <div className="flex items-center p-3 border-b bg-white shadow sticky top-0 z-10">
        <div className="w-10 h-10 bg-[#25D366] text-white font-bold rounded-full flex items-center justify-center mr-3">
          {avatarLetter}
        </div>
        <div className="text-gray-800 font-medium text-lg">{displayName}</div>
      </div>

<div className="flex-1 p-4 overflow-y-auto space-y-3">
  {messages.map((m, idx) => (
    <div
  key={idx}
  className={`flex w-full ${
    // تحقق من senderId أو sender._id حسب البيانات
    (m.senderId === userId || m.sender?._id === userId)
      ? "justify-end"
      : "justify-start"
  }`}
  ref={scrollRef}
>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`p-3 rounded-2xl max-w-xs break-words shadow ${
      (m.senderId === userId || m.sender?._id === userId)
        ? "bg-[#25D366] text-white rounded-br-none"
        : "bg-white text-gray-800 rounded-bl-none"
    }`}
  >
    {m.text && <p>{m.text}</p>}
    {m.imageUrl && (
      <Image
        src={`http://localhost:5000${m.imageUrl}`}
        alt="image"
        width={300}
        height={200}
        className="rounded mt-2"
      />
    )}
  </motion.div>
</div>

  ))}
</div>


      <div className="p-3 border-t bg-white flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-xl px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
        />
        <label className="p-2 border rounded-xl mr-2 cursor-pointer hover:bg-gray-100 transition">
          <FiPaperclip size={20} />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
        </label>
        <button
          onClick={handleSend}
          className="bg-[#25D366] text-white p-2 rounded-xl hover:bg-[#20b858] transition"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
}
