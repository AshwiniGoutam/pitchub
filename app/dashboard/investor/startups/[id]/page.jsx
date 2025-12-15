"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { InvestorSidebar } from "@/components/investor-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowBigRightDash, ArrowLeft, Dot, Key, Text, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DealDetail({ params }) {
  const { data: session } = useSession();

  const [deal, setDeal] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [founderEmail, setFounderEmail] = useState(null);
  const messagesEndRef = useRef(null);

  /* ------------------ FETCH DEAL ------------------ */
  useEffect(() => {
    fetch(`/api/deals/${params.id}`)
      .then((res) => res.json())
      .then((res) => {
        setDeal(res.data);
        console.log('res.data', res.data);

        setFounderEmail(res.data?.fromEmail || null);
      });
  }, [params.id]);

  /* ------------------ FETCH MESSAGES ------------------ */
  useEffect(() => {
    fetch(`/api/deals/${params.id}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.data || []));
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const res = await fetch(`/api/deals/${params.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        receiverEmail: deal?.founderEmail,
      }),
    });

    const data = await res.json();
    if (data.data) setMessages((prev) => [...prev, data.data]);
    setInput("");
  };

  const getInitials = (val = "") => val.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50">
      <InvestorSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-white px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Deal Workspace</h1>
            <p className="text-xs text-gray-500">From  · {deal?.founderEmail}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href='/dashboard/investor/startups' className="text-sm text-gray-600 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4 text-dark-500" /> Back to Deals
            </Link>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* ================= LEFT : DEAL CONTENT ================= */}
          <div className="w-[70%] overflow-y-auto p-8 space-y-8">
            {!deal && <p className="text-gray-400">Loading deal...</p>}

            {deal && (
              <>
                {/* Summary */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"> <Text className="h-5 w-5 text-orange-600" /> Summary</h2>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {deal.summary}
                  </p>
                </section>

                {/* Meta */}
                <section className="grid grid-cols-3 gap-4">
                  <MetaCard label="Sector" value={deal.sector} />
                  <MetaCard label="Growth Stage" value={deal.growthStage} />
                  <MetaCard
                    label="Funding Mentioned"
                    value={deal.fundingMentioned ? "Yes" : "No"}
                  />
                </section>

                {/* Market Research */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />   Market Research
                  </h2>
                  <p className="text-gray-700 text-sm">{deal.deals.marketResearch}</p>
                </section>

                {/* Competitive Analysis */}
                <section className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-600" />  Key Factors
                  </h2>

                  <ul className="space-y-3">
                    {deal.deals.competitiveAnalysis?.map((item, i) => (
                      <li
                        key={i}
                        className="p-4 rounded-lg bg-emerald-50 text-sm text-gray-800"
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Footer Meta */}
                <section className="text-xs text-gray-500 flex justify-between">
                  <span>From: {deal.founderEmail}</span>
                  <span>
                    Created:{" "}
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </span>
                </section>
              </>
            )}
          </div>

          {/* ================= RIGHT : CHAT ================= */}
          <div className="w-[30%] border-l bg-white flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 text-sm">
                  No messages yet
                </p>
              )}

              {messages.map((msg, i) => {
                const isUser =
                  msg.senderEmail === session?.user?.email;
                const initials = getInitials(msg.senderEmail);

                return (
                  <div key={i} className="space-y-1">
                    <div
                      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"
                        }`}
                    >
                      {!isUser && (
                        <Avatar className="w-7 h-7">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`px-3 py-2 rounded-xl max-w-[85%] text-sm ${isUser
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100"
                          }`}
                      >
                        {msg.message}
                      </div>

                      {isUser && (
                        <Avatar className="w-7 h-7">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    <div
                      className={`text-[10px] text-gray-400 ${isUser ? "text-right" : "text-left"
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
            </div>

            {/* Input */}
            <div className="border-t p-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ SMALL COMPONENT ------------------ */
function MetaCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 flex items-center gap-1"><ArrowBigRightDash className="h-5 w-5 text-green-600" /> {label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
}
