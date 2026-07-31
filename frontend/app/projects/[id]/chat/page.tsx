"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  streaming?: boolean;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
        isUser ? "bg-[#B7926A] text-white" : "bg-stone-100 text-stone-500"
      }`}>
        {isUser ? "Du" : "KI"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-[#B7926A] text-white rounded-tr-sm"
          : "bg-white border border-stone-200 text-stone-800 rounded-tl-sm"
      }`}>
        {msg.streaming && msg.content === "" ? (
          <div className="flex gap-1 py-1">
            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        )}
        {msg.streaming && msg.content !== "" && (
          <span className="inline-block w-0.5 h-3.5 bg-stone-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError]       = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load history ──
  useEffect(() => {
    fetch(`/api/v1/projects/${id}/chat`)
      .then(r => r.json() as Promise<{ data: ChatMessage[] | null; error: string | null }>)
      .then(json => {
        if (json.data) setMessages(json.data);
      })
      .finally(() => setLoadingHistory(false));
  }, [id]);

  // ── Auto-scroll ──
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Send ──
  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setError("");
    textareaRef.current?.focus();

    // Optimistic user message
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);

    // Placeholder assistant message
    const assistantMsg: ChatMessage = { role: "assistant", content: "", streaming: true };
    setMessages(prev => [...prev, assistantMsg]);
    setStreaming(true);

    try {
      const res = await fetch(`/api/v1/projects/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Netzwerkfehler");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const data = part.slice(6);

          if (data === "[DONE]") break;
          if (data.startsWith("[ERROR]")) {
            setError(data.slice(8));
            break;
          }

          try {
            const token: string = JSON.parse(data);
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last?.streaming) {
                updated[updated.length - 1] = { ...last, content: last.content + token };
              }
              return updated;
            });
          } catch { /* ignore malformed chunk */ }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      // Mark streaming done
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) {
          updated[updated.length - 1] = { ...last, streaming: false };
        }
        return updated;
      });
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Textarea auto-resize ──
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-stone-200 overflow-hidden">

      {/* ── Disclaimer banner ── */}
      <div className="flex items-center gap-2.5 px-5 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-xs text-amber-700">
          Dieser Chat ersetzt keine Rechtsberatung. Aussagen des Assistenten sind nicht rechtsverbindlich.
        </p>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-stone-200 border-t-[#B7926A] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 bg-[#f3ece3] rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#B7926A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700">Stell eine Frage</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Zum Projekt, zu Normen oder zu Schweizer Baurecht.
              </p>
            </div>
            {/* Starter suggestions */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "Was sind die Hauptverstösse aus der letzten Analyse?",
                "Welche Normen gelten für dieses Projekt?",
                "Was ist der Grenzabstand in dieser Bauzone?",
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="text-xs text-stone-500 border border-stone-200 rounded-full px-3 py-1.5 hover:border-[#B7926A] hover:text-[#B7926A] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={msg.id ?? i} msg={msg} />
          ))
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0 border-t border-stone-100 px-4 py-3 bg-white">
        <div className="flex items-end gap-2 bg-[#F8F7F4] rounded-2xl px-4 py-2.5 border border-stone-200 focus-within:border-[#B7926A]/60 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Frage stellen… (Enter zum Senden, Shift+Enter für neue Zeile)"
            disabled={streaming}
            className="flex-1 resize-none bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none leading-relaxed disabled:opacity-50 min-h-[22px]"
            style={{ height: "22px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-[#B7926A] text-white hover:bg-[#9E7A52] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            title="Senden"
          >
            {streaming ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-center mt-1.5">
          Powered by Claude Haiku · Nicht rechtsverbindlich
        </p>
      </div>
    </div>
  );
}
