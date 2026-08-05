"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useParams } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Thread {
  id: string;
  preview: string;
  started_at: string;
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  streaming?: boolean;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function parseInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\*(.+?)\*)/g;
  let last = 0;
  let idx  = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith("**")) {
      parts.push(<strong key={idx++} className="font-semibold">{m[2]}</strong>);
    } else if (m[0].startsWith("`")) {
      parts.push(
        <code key={idx++} className="bg-stone-100 text-stone-700 px-1 py-0.5 rounded text-[0.82em] font-mono">
          {m[3]}
        </code>
      );
    } else {
      parts.push(<em key={idx++}>{m[4]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function MarkdownContent({ text }: { text: string }) {
  const lines    = text.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`code-${i}`} className="bg-stone-100 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 text-stone-700 whitespace-pre">
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-semibold text-stone-800 text-sm mt-3 mb-0.5">
          {parseInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-bold text-stone-900 text-sm mt-4 mb-1">
          {parseInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="font-bold text-stone-900 text-base mt-4 mb-1">
          {parseInline(line.slice(2))}
        </h1>
      );
    }
    // Unordered list
    else if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-0.5 my-1.5">
          {items.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed">{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }
    // Ordered list
    else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-0.5 my-1.5">
          {items.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed">{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }
    // Horizontal rule
    else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-stone-200 my-2" />);
    }
    // Empty line → small spacer
    else if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
    }
    // Paragraph
    else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }

    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
        isUser
          ? "bg-[#B7926A] text-white"
          : "bg-stone-100 text-stone-500 border border-stone-200"
      }`}>
        {isUser ? "Du" : "KI"}
      </div>

      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? "bg-[#B7926A] text-white rounded-tr-sm"
          : "bg-white border border-stone-200 text-stone-800 rounded-tl-sm"
      }`}>
        {/* Loading dots while waiting for first token */}
        {msg.streaming && msg.content === "" && (
          <div className="flex gap-1 py-0.5">
            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {msg.content !== "" && (
          isUser ? (
            <span className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</span>
          ) : (
            <MarkdownContent text={msg.content} />
          )
        )}

        {/* Blinking cursor while streaming */}
        {msg.streaming && msg.content !== "" && (
          <span className="inline-block w-0.5 h-3.5 bg-stone-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// ── Thread sidebar item ───────────────────────────────────────────────────────

function formatThreadDate(iso: string): string {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "heute";
  if (diff === 1) return "gestern";
  return d.toLocaleDateString("de-CH", { day: "numeric", month: "short" });
}

function ThreadItem({ thread, active, onClick }: { thread: Thread; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        active
          ? "bg-[#f3ece3] text-stone-900"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
      }`}
    >
      <div className="text-xs font-medium truncate leading-snug">
        {thread.preview || "Neue Konversation"}
      </div>
      <div className="text-[10px] text-stone-400 mt-0.5">
        {formatThreadDate(thread.started_at)}
      </div>
    </button>
  );
}

// ── Starter suggestions ───────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Was sind die Hauptverstösse aus der letzten Analyse?",
  "Welche Normen gelten für dieses Projekt?",
  "Was ist der Grenzabstand in dieser Bauzone?",
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();

  const [threads, setThreads]                 = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId]   = useState<string>("");
  const [threadsLoading, setThreadsLoading]   = useState(true);

  const [messages, setMessages]               = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError]       = useState("");

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Initialize: load threads and auto-select most recent ──
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setThreadsLoading(true);
      setMessages([]);
      try {
        const res  = await fetch(`/api/v1/projects/${id}/chat/threads`);
        const json = await res.json() as { data: Thread[] | null };
        if (cancelled) return;

        const list = json.data ?? [];
        setThreads(list);

        if (list.length > 0) {
          const tid = list[0].id;
          setActiveThreadId(tid);
          setMessagesLoading(true);
          const mRes  = await fetch(`/api/v1/projects/${id}/chat?thread=${tid}`);
          const mJson = await mRes.json() as { data: ChatMessage[] | null };
          if (!cancelled) {
            if (mJson.data) setMessages(mJson.data);
            setMessagesLoading(false);
          }
        } else {
          setActiveThreadId(crypto.randomUUID());
        }
      } finally {
        if (!cancelled) setThreadsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [id]);

  // ── Auto-scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select existing thread ──
  async function selectThread(threadId: string) {
    if (activeThreadId === threadId || streaming) return;
    setActiveThreadId(threadId);
    setMessages([]);
    setError("");
    setMessagesLoading(true);
    try {
      const res  = await fetch(`/api/v1/projects/${id}/chat?thread=${threadId}`);
      const json = await res.json() as { data: ChatMessage[] | null };
      if (json.data) setMessages(json.data);
    } finally {
      setMessagesLoading(false);
    }
  }

  // ── Start new chat ──
  function startNewChat() {
    if (streaming) return;
    setActiveThreadId(crypto.randomUUID());
    setMessages([]);
    setError("");
    textareaRef.current?.focus();
  }

  // ── Refresh thread list without touching active thread / messages ──
  async function refreshThreadList() {
    try {
      const res  = await fetch(`/api/v1/projects/${id}/chat/threads`);
      const json = await res.json() as { data: Thread[] | null };
      if (json.data) setThreads(json.data);
    } catch { /* silent */ }
  }

  // ── Send message ──
  async function handleSend() {
    const text = input.trim();
    if (!text || streaming || !activeThreadId) return;

    setInput("");
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "22px";

    setMessages(prev => [
      ...prev,
      { role: "user",      content: text },
      { role: "assistant", content: "", streaming: true },
    ]);
    setStreaming(true);

    try {
      const res = await fetch(`/api/v1/projects/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, thread_id: activeThreadId }),
      });

      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => "");
        throw new Error(`Fehler ${res.status}${body ? `: ${body}` : ""}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const data = part.slice(6);

          if (data === "[DONE]") break outer;
          if (data.startsWith("[ERROR]")) { setError(data.slice(8)); break outer; }

          try {
            const token: string = JSON.parse(data);
            setMessages(prev => {
              const updated = [...prev];
              const last    = updated[updated.length - 1];
              if (last?.streaming) {
                updated[updated.length - 1] = { ...last, content: last.content + token };
              }
              return updated;
            });
          } catch { /* ignore malformed chunk */ }
        }
      }

      refreshThreadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setMessages(prev => {
        const updated = [...prev];
        const last    = updated[updated.length - 1];
        if (last?.streaming) {
          if (last.content === "") {
            // Error before any tokens arrived — remove empty bubble
            updated.pop();
          } else {
            updated[updated.length - 1] = { ...last, streaming: false };
          }
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

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }

  const isNewThread = !threads.some(t => t.id === activeThreadId);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-stone-200 overflow-hidden">

      {/* ── Thread sidebar ── */}
      <div className="w-52 shrink-0 border-r border-stone-200 flex flex-col bg-[#FAFAF9]">
        <div className="p-3 border-b border-stone-100">
          <button
            onClick={startNewChat}
            disabled={streaming}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-600 hover:border-[#B7926A] hover:text-[#B7926A] transition-colors disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neuer Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {threadsLoading ? (
            <div className="flex justify-center pt-6">
              <div className="w-4 h-4 border-2 border-stone-200 border-t-[#B7926A] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {isNewThread && (
                <ThreadItem
                  thread={{ id: activeThreadId, preview: "Neue Konversation", started_at: new Date().toISOString() }}
                  active={true}
                  onClick={() => {}}
                />
              )}
              {threads.length === 0 && !isNewThread && (
                <p className="text-[10px] text-stone-400 text-center pt-6 px-2">Noch keine Chats</p>
              )}
              {threads.map(t => (
                <ThreadItem
                  key={t.id}
                  thread={t}
                  active={activeThreadId === t.id}
                  onClick={() => selectThread(t.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Disclaimer */}
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-amber-700">
            Dieser Chat ersetzt keine Rechtsberatung. Aussagen des Assistenten sind nicht rechtsverbindlich.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messagesLoading ? (
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
                <p className="text-xs text-stone-400 mt-0.5">Zum Projekt, zu Normen oder zu Schweizer Baurecht.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-xs text-stone-500 border border-stone-200 rounded-full px-3 py-1.5 hover:border-[#B7926A] hover:text-[#B7926A] transition-colors"
                  >
                    {s}
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
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
    </div>
  );
}
