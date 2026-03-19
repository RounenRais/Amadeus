"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function useTypewriter(text: string, speed = 20) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

const INTRO = "Merhaba... Kuantum evreninin derinliklerine hoş geldin. Ne sormak istersin?";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAIText, setCurrentAIText] = useState("");
  const [inputVisible, setInputVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const { displayed, done } = useTypewriter(
    loading ? "" : currentAIText || (messages.length === 0 ? INTRO : ""),
    20
  );

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setCurrentAIText("");
    setInputVisible(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const aiText = data.result ?? "...";
      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
      setCurrentAIText(aiText);
    } catch {
      setCurrentAIText("Bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (done) {
      setInputVisible(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [done]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const dialogueText = loading
    ? "..."
    : currentAIText
    ? displayed
    : messages.length === 0
    ? displayed
    : "";

  return (
    <div className="root">
      {/* History */}
      <div className="history" ref={historyRef}>
        {messages.slice(0, -1).map((m, i) => (
          <div key={i} className={`history-line ${m.role}`}>
            <span className="name">{m.role === "assistant" ? "Amadeus" : "You"}</span>
            <span className="text">{m.content}</span>
          </div>
        ))}
      </div>

      {/* Dialogue box */}
      <div className="dialogue-box">
        <div className="name-tag">Amadeus</div>
        <p className="dialogue-text">
          {dialogueText}
          {!done && !loading && dialogueText && <span className="cursor">▍</span>}
          {loading && (
            <span className="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          )}
        </p>
      </div>

      {/* Input */}
      <div className={`input-row ${inputVisible ? "visible" : "hidden"}`}>
        <span className="arrow">▶</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Bir şey yaz..."
          autoComplete="off"
        />
        <button onClick={sendMessage} disabled={loading}>Gönder</button>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          width: 100vw;
          height: 100dvh;
          background: #0d0d0d;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-family: 'Georgia', serif;
          color: #e8e8e8;
        }

        /* History */
        .history {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: none;
        }
        .history::-webkit-scrollbar { display: none; }

        .history-line {
          display: flex;
          gap: 12px;
          opacity: 0.45;
          font-size: 13px;
          line-height: 1.6;
        }
        .history-line .name {
          min-width: 54px;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding-top: 2px;
          color: #888;
        }
        .history-line.assistant .name { color: #7dd3fc; }
        .history-line.user .name { color: #c4b5fd; }
        .history-line .text { color: #aaa; }

        /* Dialogue box */
        .dialogue-box {
          position: relative;
          margin: 0 16px;
          background: rgba(15, 15, 20, 0.97);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 22px 24px 18px;
          min-height: 100px;
        }
        .name-tag {
          position: absolute;
          top: -13px;
          left: 18px;
          background: #0d0d0d;
          border: 1px solid rgba(125,211,252,0.4);
          color: #7dd3fc;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 2px 10px;
          border-radius: 2px;
        }
        .dialogue-text {
          font-size: clamp(14px, 2.2vw, 16px);
          line-height: 1.8;
          color: #e8e8e8;
          min-height: 52px;
        }
        .cursor {
          color: #7dd3fc;
          animation: blink 0.65s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .dots span {
          color: #7dd3fc;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        /* Input */
        .input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 16px 20px;
          background: rgba(15,15,20,0.97);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 10px 14px;
          transition: opacity 0.25s, transform 0.25s;
        }
        .input-row.hidden {
          opacity: 0;
          pointer-events: none;
          transform: translateY(4px);
        }
        .input-row.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .arrow {
          color: #c4b5fd;
          font-size: 10px;
        }
        input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #e8e8e8;
          font-family: 'Georgia', serif;
          font-size: clamp(13px, 2vw, 15px);
          caret-color: #c4b5fd;
        }
        input::placeholder { color: #333; }
        button {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #888;
          font-family: 'Georgia', serif;
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
        }
        button:hover { border-color: #7dd3fc; color: #7dd3fc; }
        button:disabled { opacity: 0.2; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
