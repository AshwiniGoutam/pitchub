"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DealDetail({ params }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(`/api/deals/${params.id}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.data || []));
  }, [params.id]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const res = await fetch(`/api/deals/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    if (data.data) setMessages((prev) => [...prev, data.data]);
    setInput("");
  };

  // Helper to get initials from email/name
  const getInitials = (emailOrName = "") => emailOrName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <InvestorSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white px-8 py-4 flex justify-between items-center">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold text-gray-800">Deals</h1>
            <p className="text-sm text-gray-500">
              Collaborative Workspace · Deal ID: {params.id}
            </p>
          </div>
        </header>

        {/* Chat Section */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">
              No messages yet. Start the conversation below 👇
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.senderEmail === session?.user?.email;
            const initials = getInitials(msg.senderEmail);
            return (
              <div
                className={`flex flex-col ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  key={i}
                  className={`flex items-end gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[65%] shadow-sm ${
                      isUser
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-emerald-50 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>

                    {msg.task && (
                      <div className="mt-2 border-t border-emerald-100 pt-2 text-sm flex items-center gap-2">
                        ✅ <span>{msg.task.title}</span>
                        <span className="text-gray-500 text-xs">
                          (Due:{" "}
                          {new Date(msg.task.dueDate).toLocaleDateString()})
                        </span>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div
                  className={`mt-2 text-[11px] ${
                    isUser ? "text-dark text-end" : "text-dark"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* Sticky Input Box */}
        <footer className="sticky bottom-0 bg-white border-t px-6 py-3 flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or create a task..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
          >
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}
