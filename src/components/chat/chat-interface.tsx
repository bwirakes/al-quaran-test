"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, MessageCircle, User, ArrowLeft, Square } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";

function generateUUID(): string {
  return crypto.randomUUID();
}

const SUGGESTED_QUESTIONS = [
  "Apa makna Surah Al-Fatihah?",
  "Bagaimana cara shalat yang benar?",
  "Jelaskan tentang puasa Ramadhan",
  "Apa itu Ayatul Kursi dan keutamaannya?",
  "Bagaimana cara bertaubat yang benar?",
  "Jelaskan rukun Islam",
];

export function ChatInterface() {
  const chatId = useRef(generateUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");

  // Memoize the transport to prevent recreation on each render
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest(request) {
          const lastMessage = request.messages.at(-1);
          return {
            body: {
              id: request.id,
              message: lastMessage,
              messages: request.messages,
            },
          };
        },
      }),
    []
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: chatId.current,
    generateId: generateUUID,
    transport,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check if we can send a message (not currently streaming or submitted)
  const canSend = status === "ready" || status === "error";
  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim() || !canSend) return;

      sendMessage({
        role: "user",
        parts: [{ type: "text", text: inputValue.trim() }],
      });
      setInputValue("");
      
      // Focus back to textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 100);
    },
    [inputValue, sendMessage, canSend]
  );

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      if (!canSend) return;
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: question }],
      });
    },
    [sendMessage, canSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex h-dvh flex-col bg-stone-50">
      {/* Floating Header */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-stone-200/50 rounded-2xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back + Title */}
              <div className="flex items-center gap-3">
                <Link href="/">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200">
                    <ArrowLeft className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                  </button>
                </Link>
                <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900">
                    Asisten Islam
                  </h1>
                  <p className="text-xs text-slate-500 -mt-0.5">
                    Tanya jawab Al-Quran & Islam
                  </p>
                </div>
              </div>
              
              {/* Right: Quick Links */}
              <nav className="hidden sm:flex items-center gap-1">
                <Link 
                  href="/quran" 
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  Daftar Surah
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20 shrink-0" />

      {/* Messages Area */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectQuestion={handleSuggestedQuestion} />
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && messages.at(-1)?.role === "user" && (
                <ThinkingIndicator />
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="shrink-0 border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 rounded-2xl border border-stone-200 bg-white p-2 transition-colors focus-within:border-sky-400 shadow-sm">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda tentang Al-Quran atau Islam..."
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                rows={1}
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-800"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim() || !canSend}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors hover:opacity-90 disabled:bg-stone-200 disabled:text-stone-400"
                  style={{ backgroundColor: '#496580' }}
                >
                  <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </form>
          <p className="mt-2 text-center text-xs text-slate-400">
            Respons AI bersifat informatif. Untuk masalah kompleks, konsultasikan dengan ulama.
          </p>
        </div>
      </footer>
    </div>
  );
}

function WelcomeScreen({ onSelectQuestion }: { onSelectQuestion: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200">
        <MessageCircle className="h-8 w-8" style={{ color: '#496580' }} strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900">
        Assalamu&apos;alaikum!
      </h2>
      <p className="mb-8 max-w-md text-center text-slate-500">
        Saya adalah asisten AI yang siap membantu Anda memahami Al-Quran dan ajaran Islam. Silakan ajukan pertanyaan Anda.
      </p>
      <div className="w-full max-w-2xl">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
          Coba tanyakan
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              onClick={() => onSelectQuestion(question)}
              className="rounded-xl border border-stone-200 bg-white p-4 text-left text-sm text-slate-900 transition-all hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChatMessage {
  id: string;
  role: string;
  parts?: Array<{ type: string; text?: string }>;
  content?: string;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  
  // Extract text from parts or fallback to content
  const text = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("") || message.content || "";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-sky-50 border border-sky-200"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <MessageCircle className="h-4 w-4" style={{ color: '#496580' }} strokeWidth={1.5} />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-slate-900 text-white"
            : "border border-stone-200 bg-white text-slate-900 shadow-sm"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {text}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200">
        <MessageCircle className="h-4 w-4 animate-pulse" style={{ color: '#496580' }} strokeWidth={1.5} />
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <span>Sedang berpikir</span>
          <span className="inline-flex">
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
