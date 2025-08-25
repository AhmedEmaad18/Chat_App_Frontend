// pages/chat/[conversationId].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../utils/api";
import { socket } from "../../utils/socket";

export default function Chat() {
  const router = useRouter();
  const { conversationId } = router.query;
  const userId = localStorage.getItem("userId");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data);
    };
    fetchMessages();

    socket.on("getMessage", (msg) => {
      if (msg.senderId !== userId) setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("getMessage");
    };
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("text", text);
    if (image) formData.append("image", image);

    const res = await api.post("/messages", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setMessages(prev => [...prev, res.data]);
    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: res.data.conversationId, // receiverId لازم تحدده صح
      text,
      imageUrl: res.data.imageUrl
    });

    setText("");
    setImage(null);
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map(msg => (
          <div key={msg._id || msg.createdAt}>
            <b>{msg.sender === userId ? "You" : "Them"}:</b>
            <span>{msg.text}</span>
            {msg.imageUrl && <img src={`http://localhost:5000${msg.imageUrl}`} width="100" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type..." />
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
