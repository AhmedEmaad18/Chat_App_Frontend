"use client";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export default function UserList({ userId, onStartChat, conversations }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/auth/all-users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chattedUserIds = conversations
          ? conversations.flatMap((c) => (c.participants || []).map((p) => p?._id).filter(Boolean))
          : [];

        const filteredUsers = res.data.filter(
          (u) => u._id !== userId && !chattedUserIds.includes(u._id)
        );

        setUsers(filteredUsers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [userId, conversations]);

  if (users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        No users available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded p-2 overflow-y-auto">
      <AnimatePresence>
        {users.map((u) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer p-3 mb-2 bg-white rounded shadow-sm hover:bg-blue-50 hover:scale-105 transition transform"
            onClick={() => onStartChat(u)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-white font-bold">
                {u.username[0].toUpperCase()}
              </div>
              <div className="text-gray-800 font-medium">{u.username}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
