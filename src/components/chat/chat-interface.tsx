"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Sparkles, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useEffect, useState } from "react";

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

  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: chatId.current,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
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
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim() || status !== "ready") return;

      sendMessage({
        role: "user",
        parts: [{ type: "text", text: inputValue.trim() }],
      });
      setInputValue("");
    },
    [inputValue, sendMessage, status]
  );

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      if (status !== "ready") return;
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: question }],
      });
    },
    [sendMessage, status]
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

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-[#fefcfa] to-[#f8f5f0]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link href="/" className="group">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 transition-all hover:bg-secondary">
              <ArrowLeft className="h-5 w-5 text-slate" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky to-mint">
              <Sparkles className="h-5 w-5 text-slate" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Asisten Islam</h1>
              <p className="text-sm text-muted-foreground">
                Tanya jawab seputar Al-Quran & Islam
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeScreen onSelectQuestion={handleSuggestedQuestion} />
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && messages.at(-1)?.role === "user" && (
                <ThinkingIndicator />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 border-t border-border/40 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-white p-2 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan Anda tentang Al-Quran atau Islam..."
                className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                rows={1}
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive text-white transition-all hover:bg-destructive/90"
                >
                  <div className="h-3 w-3 rounded-sm bg-white" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
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
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-peach/60 to-sky/60 shadow-lg">
        <Sparkles className="h-10 w-10 text-slate" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">
        Assalamu&apos;alaikum!
      </h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Saya adalah asisten AI yang siap membantu Anda memahami Al-Quran dan ajaran Islam. Silakan ajukan pertanyaan Anda.
      </p>
      <div className="w-full max-w-2xl">
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
          Coba tanyakan:
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              onClick={() => onSelectQuestion(question)}
              className="rounded-xl border border-border/60 bg-white p-4 text-left text-sm text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-secondary/30 hover:shadow-md"
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
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-sky/60 to-mint/60 ring-1 ring-border/40"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-slate" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-white shadow-sm ring-1 ring-border/40"
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky/60 to-mint/60 ring-1 ring-border/40">
        <Sparkles className="h-4 w-4 animate-pulse text-slate" />
      </div>
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-border/40">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
