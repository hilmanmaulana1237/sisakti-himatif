"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { IconSend, IconX, IconSparkles, IconRobotFace, IconCheck, IconMoodSmile } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning_details?: any;
}

const QUICK_REPLIES = [
  { label: "💬 Curhat", message: "Hai SI SAKTI, aku lagi butuh teman curhat nih..." },
  { label: "📚 Akademik", message: "Aku mau konsultasi masalah akademik" },
  { label: "💰 Info UKT", message: "Aku mau tanya soal prosedur banding UKT" },
  { label: "📋 Hak Mahasiswa", message: "Apa saja hak-hak mahasiswa IF yang perlu aku tahu?" },
];

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // To prevent render flash
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Load dari Cache
  useEffect(() => {
    const savedCache = localStorage.getItem("sisakti_chat_cache");
    if (savedCache) {
      try {
        const parsed = JSON.parse(savedCache);
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setHasInteracted(parsed.hasInteracted ?? true);
          setIsResolved(parsed.isResolved ?? false);
        }
      } catch (e) {
        console.error("Gagal meload chat cache", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save ke Cache setiap pesan bertambah atau status berubah
  useEffect(() => {
    if (isInitialized) {
      if (messages.length > 0) {
        localStorage.setItem("sisakti_chat_cache", JSON.stringify({
          messages: messages,
          isResolved: isResolved,
          hasInteracted: hasInteracted
        }));
      } else {
        localStorage.removeItem("sisakti_chat_cache");
      }
    }
  }, [messages, isResolved, hasInteracted, isInitialized]);

  // Simpan log chat ke server
  const saveChatLog = async (status: "resolved" | "abandoned") => {
    if (messages.length < 2) return; // Minimal 1 user + 1 assistant
    try {
      await fetch("/api/chatlogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          status,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Gagal menyimpan log chat:", err);
    }
  };

  // Tombol "Masalah Teratasi"
  const handleResolved = async () => {
    await saveChatLog("resolved");
    setIsResolved(true);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "Terima kasih! Senang bisa membantu 😊 Semoga masalahmu terselesaikan. Jangan ragu untuk kembali chat kapan saja!\n\n💡 Kami sangat menghargai feedbackmu. Kunjungi halaman /feedback untuk memberikan penilaian terhadap layanan SI SAKTI. Terima kasih!"
    }]);
  };

  // Reset chat untuk sesi baru
  const handleNewSession = () => {
    setMessages([]);
    setInput("");
    setIsResolved(false);
    setHasInteracted(false);
    localStorage.removeItem("sisakti_chat_cache");
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isResolved) return;
    setHasInteracted(true);

    const userMsg: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages([...newMessages, { role: "assistant", content: err.error || "Maaf, aku sedang mengalami masalah. Coba lagi ya! 😅" }]);
        setIsLoading(false);
        return;
      }

      const responseData = await res.json();

      setMessages([...newMessages, {
        role: "assistant",
        content: responseData.content,
        reasoning_details: responseData.reasoning_details
      }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Ups, ada gangguan internal. Coba lagi nanti ya! 🔄" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Panel Chat */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-[9998] w-full h-full md:w-[400px] md:h-[600px] md:max-h-[80vh] flex flex-col bg-white dark:bg-neutral-900 md:rounded-2xl shadow-2xl border-0 md:border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-blue to-brand-darkBlue text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/20">
                <Image src="/maskot/pp.png" width={34} height={34} alt="SI SAKTI" className="object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight tracking-wide">SI SAKTI</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-white/80 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse border border-green-500" />
                  {isLoading ? "Sedang berpikir..." : "Online"}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors">
              <IconX className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-50 dark:bg-black/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 animate-count-up">
                <div className="relative w-28 h-28 mb-4">
                  <Image src="/maskot/2.png" fill alt="SI SAKTI" className="object-contain drop-shadow-lg" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Hai! Aku SI SAKTI 👋</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                  Robot advokasimu dari KASTRAD HIMATIF. Pusing ngerjain tugas, punya masalah akademik, atau pengen curhat? Aku siap bantu temenin!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_REPLIES.map((qr, i) => (
                    <button key={i} onClick={() => sendMessage(qr.message)} className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:border-brand-blue hover:text-brand-blue transition-all shadow-sm">
                      {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-brand-lightBlue/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                    <IconRobotFace className="w-5 h-5 text-brand-blue" />
                  </div>
                )}
                <div className={`max-w-[85%] px-4 py-3 rounded-[20px] text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-brand-blue text-white rounded-br-sm shadow-md whitespace-pre-wrap"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm shadow-sm prose prose-sm prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-neutral dark:prose-invert prose-strong:font-bold prose-strong:text-brand-blue"
                  }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Animasi sedang berpikir */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-brand-lightBlue/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                  <IconRobotFace className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="px-4 py-4 rounded-[20px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action bar: Teratasi / Quick Replies */}
          {hasInteracted && !isLoading && messages.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto scroll-hide shrink-0">
              {!isResolved ? (
                <>
                  <button onClick={handleResolved} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-xs font-bold text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all whitespace-nowrap shrink-0">
                    <IconCheck className="w-3.5 h-3.5" /> Masalah Teratasi
                  </button>
                  <button onClick={() => sendMessage("Bagaimana cara menghubungi KASTRAD langsung?")} className="px-3.5 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-brand-blue/10 hover:text-brand-blue transition-all whitespace-nowrap shrink-0 border border-neutral-200 dark:border-neutral-700">
                    📞 Hubungi KASTRAD
                  </button>
                </>
              ) : (
                <div className="flex gap-2 w-full">
                  <a href="/feedback" className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-blue/10 border border-brand-blue/30 text-xs font-bold text-brand-blue hover:bg-brand-blue/20 transition-all">
                    <IconMoodSmile className="w-3.5 h-3.5" /> Beri Feedback
                  </a>
                  <button onClick={handleNewSession} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-brand-blue transition-all">
                    🔄 Chat Baru
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Input Form */}
          {!isResolved && (
            <form onSubmit={handleSubmit} className="flex items-end gap-2 px-4 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cerita bareng SI SAKTI..."
                rows={1}
                className="flex-1 resize-none bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all max-h-[120px] overflow-y-auto"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-darkBlue hover:from-brand-blue hover:to-blue-800 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md"
              >
                <IconSend className="w-5 h-5 ml-1" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Bubble Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-[9998] group">
          <div className="relative">
            {!hasInteracted && (
              <div className="absolute inset-0 rounded-full bg-brand-blue/40 animate-ping" />
            )}
            <div className="relative w-16 h-16 md:w-13 md:h-13 bg-gradient-to-br from-brand-lightBlue via-brand-blue to-brand-darkBlue p-0.5 rounded-full shadow-[0_10px_40px_rgba(59,130,246,0.6)] flex items-center justify-center hover:scale-105 transition-transform overflow-hidden cursor-pointer group-hover:shadow-[0_10px_50px_rgba(59,130,246,0.8)]">
              <div className="w-full h-full bg-white dark:bg-brand-black rounded-full flex items-center justify-center p-2 relative">
                <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-md" />
                <Image src="/maskot/pp.png" width={55} height={55} alt="Chat SI SAKTI" className="object-contain relative drop-shadow-md group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
            <div className="absolute top-0 right-14 md:right-20 translate-y-2 translate-x-4 group-hover:-translate-y-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border dark:border-neutral-200 text-xs font-bold px-4 py-2.5 rounded-xl rounded-tr-none opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl">
              Butuh Teman Cerita? <IconSparkles className="w-3.5 h-3.5 inline ml-1 text-brand-blue" />
            </div>
          </div>
        </button>
      )}
    </>
  );
}
