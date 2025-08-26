"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { useRouter } from "next/navigation";
import "../app/globals.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Success✅");
        setForm({ username: "", email: "", password: "" });
        setSuccess(true);

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setMessage(data.message || "Faild!");
        setSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Error connecting to server");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#128C7E] to-[#25D366]">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-[#075E54] mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#25D366]">
            <FiUser className="text-gray-400 mr-2" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="flex-1 outline-none"
            />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#25D366]">
            <FiMail className="text-gray-400 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="flex-1 outline-none"
            />
          </div>

          <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#25D366]">
            <FiLock className="text-gray-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="flex-1 outline-none"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#20b858] transition flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Register"
            )}
          </motion.button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-center text-sm font-medium ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
