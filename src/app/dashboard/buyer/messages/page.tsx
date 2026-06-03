"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Send, Paperclip, Search, User, MoreVertical,
  Loader2, ArrowLeft,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Participant {
  id: string;
  name: string | null;
  avatar: string | null;
  isOnline: boolean;
}

interface Conversation {
  id: string;
  listingId?: string;
  lastMessageAt?: string;
  unreadCount: number;
  otherParticipants: Participant[];
  messages: {
    id: string;
    content: string;
    messageType: string;
    createdAt: string;
    senderId: string;
  }[];
}

interface Message {
  id: string;
  content: string;
  messageType: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string | null; avatar: string | null };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) fetchMessages(activeConvId);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5s when a conversation is open
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => fetchMessages(activeConvId), 5000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    const res = await fetch(`/api/messages/${convId}?limit=50`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
  };

  const openConversation = (convId: string) => {
    setActiveConvId(convId);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return;
    setSending(true);

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      messageType: "text",
      createdAt: new Date().toISOString(),
      senderId: session?.user?.id ?? "",
      sender: {
        id: session?.user?.id ?? "",
        name: session?.user?.name ?? null,
        avatar: session?.user?.image ?? null,
      },
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      await fetch(`/api/messages/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      await fetchMessages(activeConvId);
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-crown-gold mb-0.5">
            Inbox
          </p>
          <h1 className="font-serif text-2xl text-crown-ivory">
            Messages {totalUnread > 0 && (
              <span className="font-sans text-sm text-crown-gold">
                ({totalUnread})
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden luxury-card">
        {/* Conversation list */}
        <div className={`w-full lg:w-80 border-r border-crown-gold/10 flex flex-col
                        ${mobileView === "chat" ? "hidden lg:flex" : "flex"}`}>
          {/* Search */}
          <div className="p-3 border-b border-crown-gold/10">
            <div className="flex items-center gap-2 border border-crown-gold/15 bg-crown-obsidian px-3 py-2">
              <Search className="w-3.5 h-3.5 text-crown-ash shrink-0" />
              <input
                placeholder="Search conversations..."
                className="bg-transparent border-none outline-none text-crown-ivory
                           font-sans text-xs flex-1 placeholder:text-crown-ash/40"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-crown-gold animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center px-6">
                <p className="font-serif text-crown-ash text-lg mb-1">No messages yet</p>
                <p className="font-sans text-[10px] text-crown-ash/40">
                  Start a conversation by contacting a seller
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.otherParticipants[0];
                const lastMsg = conv.messages[0];
                const isActive = activeConvId === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full flex items-center gap-3 p-4 border-b border-crown-gold/6
                                text-left transition-all hover:bg-crown-gold/5 ${
                      isActive ? "bg-crown-gold/8 border-l-2 border-l-crown-gold" : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      {other?.avatar ? (
                        <Image src={other.avatar} alt={other.name ?? ""} width={40} height={40}
                               className="rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-crown-gold/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-crown-gold/60" />
                        </div>
                      )}
                      {other?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400
                                         rounded-full border-2 border-crown-obsidian" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`font-sans text-xs truncate ${
                          conv.unreadCount > 0 ? "text-crown-ivory font-medium" : "text-crown-ash"
                        }`}>
                          {other?.name ?? "User"}
                        </p>
                        <span className="font-sans text-[8px] text-crown-ash/40 shrink-0 ml-1">
                          {lastMsg ? formatRelativeTime(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      <p className="font-sans text-[10px] text-crown-ash/60 truncate">
                        {lastMsg?.content ?? "Start a conversation"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-crown-gold rounded-full flex items-center
                                       justify-center font-sans text-[8px] text-black font-bold shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-crown-gold/10">
                <button
                  onClick={() => setMobileView("list")}
                  className="lg:hidden text-crown-ash hover:text-crown-gold mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {activeConv.otherParticipants[0]?.avatar ? (
                  <Image
                    src={activeConv.otherParticipants[0].avatar}
                    alt={activeConv.otherParticipants[0].name ?? ""}
                    width={36} height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 bg-crown-gold/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-crown-gold/60" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-crown-ivory">
                    {activeConv.otherParticipants[0]?.name ?? "User"}
                  </p>
                  {activeConv.otherParticipants[0]?.isOnline && (
                    <p className="font-sans text-[8px] text-emerald-400 tracking-widest uppercase">
                      Online
                    </p>
                  )}
                </div>
                <button className="text-crown-ash hover:text-crown-gold transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId === session?.user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`px-4 py-2.5 font-sans text-sm leading-relaxed ${
                          isMe
                            ? "bg-crown-gold/20 border border-crown-gold/30 text-crown-ivory"
                            : "bg-crown-obsidian-light border border-crown-gold/10 text-crown-ash"
                        }`}>
                          {msg.content}
                        </div>
                        <span className="font-sans text-[8px] text-crown-ash/30">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-crown-gold/10 p-4 flex gap-3">
                <button className="text-crown-ash hover:text-crown-gold transition-colors shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-b border-crown-gold/15 text-crown-ivory
                             font-sans text-sm py-1 outline-none placeholder:text-crown-ash/40
                             focus:border-crown-gold/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-9 h-9 bg-gold-gradient flex items-center justify-center
                             text-white hover:opacity-90 transition-opacity
                             disabled:opacity-40 shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border border-crown-gold/20 flex items-center justify-center
                                mx-auto mb-4">
                  <Send className="w-6 h-6 text-crown-ash/30" />
                </div>
                <p className="font-serif text-crown-ash text-xl mb-1">Select a conversation</p>
                <p className="font-sans text-[10px] text-crown-ash/40">
                  Choose from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
