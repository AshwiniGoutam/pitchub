"use client";

import { useEffect, useState } from "react";
import { FounderSidebar } from "@/components/founder-sidebar";
import { Button } from "@/components/ui/button";

export default function FounderChats() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch("/api/founder/chats")
      .then((res) => res.json())
      .then((res) => setChats(res.data || []));
  }, []);

  const openChat = async (chat) => {
    setActiveChat(chat);
    const res = await fetch(`/api/founder/chats/${chat.email}`);
    const data = await res.json();
    setMessages(data.data || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const res = await fetch(`/api/deals/${activeChat.dealId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        receiverEmail: activeChat.email,
      }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, data.data]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      <FounderSidebar />

      {/* Inbox */}
      <div className="w-80 border-r p-4">
        <h2 className="font-bold mb-4">Investor Chats</h2>

        {chats.map((chat) => (
          <div
            key={chat.email}
            onClick={() => openChat(chat)}
            className={`p-3 rounded cursor-pointer hover:bg-muted border-b border-[#ccc9] ${
              activeChat?.email === chat.email && "bg-muted"
            }`}
          >
            <p className="font-medium mb-0">{chat.name || chat.email}</p>
            <span className="text-xs text-gray-800">
              {new Date(chat?.lastAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a chat
          </div>
        ) : (
          <>
            <div className="border-b p-4 font-semibold">
              Chat with {activeChat.name || activeChat.email}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-xs p-3 rounded ${
                    msg.senderEmail === activeChat.email
                      ? "bg-muted"
                      : "bg-emerald-600 text-white ml-auto"
                  }`}
                >
                  {msg.message}
                </div>
                
              ))}
            </div>

            <div className="border-t p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type message..."
                className="flex-1 border rounded px-3 py-2"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
