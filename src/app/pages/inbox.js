// pages/inbox.js
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import Link from "next/link";
import { socket } from "../utils/socket";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await api.get("/conversations");
      setConversations(res.data);
    };
    fetchConversations();

    // سجل أونلاين
    socket.emit("addUser", userId);
  }, []);

  return (
    <div>
      <h1>Inbox</h1>
      <ul>
        {conversations.map(conv => {
          const otherUser = conv.participants.find(p => p._id !== userId);
          return (
            <li key={conv._id}>
              <Link href={`/chat/${conv._id}`}>{otherUser.username}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
