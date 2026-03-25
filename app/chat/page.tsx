"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Emotion = "default" | "surprised" | "happy" | "angry" | "sad" | "blush";

const SPRITES: Record<Emotion, { idle: string[]; talk: string[] }> = {
  default: {
    idle: ["CRS_JMD_40000b00", "CRS_JMD_40000a00"],
    talk: ["CRS_JMD_40000b00", "CRS_JMD_40000b01", "CRS_JMD_40000b02"],
  },
  surprised: {
    idle: ["CRS_JMD_40000700", "CRS_JMD_40000a00"],
    talk: ["CRS_JMD_40000700", "CRS_JMD_40000701", "CRS_JMD_40000702", "CRS_JMD_40000701"],
  },
  happy: {
    idle: ["CRS_JMD_40000600"],
    talk: ["CRS_JMD_40000600", "CRS_JMD_40000601", "CRS_JMD_40000602", "CRS_JMD_40000601"],
  },
  angry: {
    idle: ["CRS_JMD_40000400", "CRS_JMD_40000a00"],
    talk: ["CRS_JMD_40000400", "CRS_JMD_40000401", "CRS_JMD_40000402", "CRS_JMD_40000401"],
  },
  sad: {
    idle: ["CRS_JMD_40000900", "CRS_JMD_40000a00"],
    talk: ["CRS_JMD_40000900", "CRS_JMD_40000901", "CRS_JMD_40000902", "CRS_JMD_40000901"],
  },
  blush: {
    idle: ["CRS_JMD_40000800"],
    talk: ["CRS_JMD_40000800", "CRS_JMD_40000801", "CRS_JMD_40000802"],
  },
};

function parseEmotion(text: string): { emotion: Emotion; clean: string } {
  const match = text.match(/\[EMOTION:(\w+)\]/i);
  const raw = match?.[1]?.toLowerCase() ?? "default";
  const emotion: Emotion = (
    ["default", "surprised", "happy", "angry", "sad", "blush"] as Emotion[]
  ).includes(raw as Emotion)
    ? (raw as Emotion)
    : "default";
  return { emotion, clean: text.replace(/\[EMOTION:\w+\]/gi, "").trim() };
}

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

const INTRO = "The Amadeus system is active. I'm built on Makise Kurisu's memory data. What would you like to ask?";

export default function Home() {
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [currentText, setCurrentText]     = useState("");
  const [emotion, setEmotion]             = useState<Emotion>("default");
  const [currentSprite, setCurrentSprite] = useState("CRS_JMD_40000b00");
  const [inputVisible, setInputVisible]   = useState(true);
  const [isTalking, setIsTalking]         = useState(false);

  const inputRef   = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLParagraphElement>(null);
  const talkRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emotionRef = useRef<Emotion>("default");
  const talkingRef = useRef(false);
  emotionRef.current = emotion;
  talkingRef.current = isTalking;

  const { displayed, done } = useTypewriter(
    loading ? "" : currentText || (messages.length === 0 ? INTRO : ""),
    22,
  );

  const scheduleBlink = useCallback(() => {
    if (blinkRef.current) clearTimeout(blinkRef.current);
    const delay = 3000 + Math.random() * 4000;
    blinkRef.current = setTimeout(() => {
      if (talkingRef.current || emotionRef.current === "happy") {
        scheduleBlink(); return;
      }
      const idle1 = SPRITES[emotionRef.current].idle[1];
      if (!idle1) { scheduleBlink(); return; }
      setCurrentSprite(idle1);
      setTimeout(() => {
        setCurrentSprite(SPRITES[emotionRef.current].idle[0]);
        scheduleBlink();
      }, 120);
    }, delay);
  }, []);

  useEffect(() => {
    scheduleBlink();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, [scheduleBlink]);

  useEffect(() => {
    const sp = SPRITES[emotion];
    const talking = !done && !!currentText;
    setIsTalking(talking);
    if (talking) {
      let idx = 0;
      talkRef.current = setInterval(() => {
        setCurrentSprite(sp.talk[idx % sp.talk.length]);
        idx++;
      }, 160);
    } else {
      if (talkRef.current) clearInterval(talkRef.current);
      setCurrentSprite(sp.idle[0]);
    }
    return () => { if (talkRef.current) clearInterval(talkRef.current); };
  }, [done, emotion, currentText]);

  useEffect(() => {
    if (textRef.current)
      textRef.current.scrollTop = textRef.current.scrollHeight;
  }, [displayed]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput(""); setLoading(true); setCurrentText(""); setInputVisible(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const { emotion: newEmotion, clean } = parseEmotion(data.result ?? "...");
      setEmotion(newEmotion);
      setMessages(prev => [...prev, { role: "assistant", content: clean }]);
      setCurrentText(clean);
    } catch { setCurrentText("An error occurred."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (done) { setInputVisible(true); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [done]);

  useEffect(() => {
    if (historyRef.current)
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [messages]);

  const dialogueText = loading ? "" : currentText ? displayed : messages.length === 0 ? displayed : "";

  return (
    <div className="root">

      {/* Full-screen character */}
      <div className="char-area">
        <img
          src={`/${currentSprite}.png`}
          alt="Amadeus"
          className={`char ${loading ? "idle" : ""}`}
        />
        {/* Gradient fade at bottom so dialogue blends nicely */}
        <div className="char-fade" />
      </div>

      {/* Dialogue overlay — sits on top of character */}
      <div className="dlg-overlay">
        <div className="dlg-inner">

          {/* History */}
          {messages.length > 1 && (
            <div className="history-box" ref={historyRef}>
              {messages.slice(0, -1).map((m, i) => (
                <div key={i} className={`hline ${m.role}`}>
                  <span className="hname">{m.role === "assistant" ? "Amadeus" : "YOU"}</span>
                  <span className="htext">{m.content}</span>
                </div>
              ))}
            </div>
          )}

          {/* Main dialogue box */}
          <div className="dlg-box">
            <div className="name-tag">Amadeus</div>
            <p className="dlg-text" ref={textRef}>
              {dialogueText}
              {!done && !loading && dialogueText && <span className="cur">▍</span>}
              {loading && (
                <span className="dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              )}
            </p>
          </div>

          {/* Input */}
          <div className={`input-row ${inputVisible ? "vis" : "hid"}`}>
            <span className="arr">▶</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              autoComplete="off"
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>

        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .root {
          width: 100vw;
          height: 100dvh;
          background: #08080f;
          overflow: hidden;
          position: relative;
          font-family: 'Georgia', serif;
          background:url("/bg.jpg") center bottom/cover no-repeat;
        }

        /* ── Character — fills entire screen ── */
        .char-area {
          position: absolute;
          inset: 0;
          
          display: flex;
          justify-content: center;
          align-items: flex-end;
          pointer-events: none;
        }
        .char {
          height: 100dvh;
          width: auto;
          object-fit: contain;
          object-position: bottom center;
          /* subtle float animation always on */
        }
        .char.idle {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        /* Gradient at bottom so dialogue box blends in */
        .char-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(to top, rgba(8,8,15,0.92) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ── Dialogue overlay — sits above character ── */
        .dlg-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 10;
        }
        .dlg-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── History ── */
        .history-box {
          background: rgba(4, 4, 14, 0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 8px 16px;
          max-height: 72px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 3px;
          scrollbar-width: none;
          backdrop-filter: blur(8px);
        }
        .history-box::-webkit-scrollbar { display: none; }
        .hline {
          display: flex;
          gap: 12px;
          font-size: 11px;
          opacity: 0.45;
          line-height: 1.5;
        }
        .hname {
          min-width: 56px;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7dd3fc;
          padding-top: 1px;
          flex-shrink: 0;
        }
        .hline.user .hname { color: #c4b5fd; }
        .htext { color: #bbb; }

        /* ── Main dialogue box ── */
        .dlg-box {
          position: relative;
          background: rgba(6, 6, 18, 0.82);
          border: 1px solid rgba(125, 211, 252, 0.18);
          border-radius: 6px;
          padding: 22px 24px 18px;
          backdrop-filter: blur(12px);
          box-shadow:
            0 0 0 1px rgba(125,211,252,0.04),
            0 8px 32px rgba(0,0,0,0.5);
        }
        .name-tag {
          position: absolute;
          top: -14px;
          left: 20px;
          background: #06060f;
          border: 1px solid rgba(125, 211, 252, 0.5);
          color: #9a4945 ;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 3px 12px;
          border-radius: 3px;
        }
        .dlg-text {
          font-size: clamp(14px, 2vw, 17px);
          line-height: 1.85;
          color: #eef0f5;
          min-height: 56px;
          max-height: 120px;
          overflow-y: auto;
          scrollbar-width: none;
          font-family: 'Georgia', serif;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 8px rgba(0,0,0,0.8);
        }
        .dlg-text::-webkit-scrollbar { display: none; }

        .cur {
          color: #7dd3fc;
          animation: blink 0.65s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .dots span {
          color: #7dd3fc;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .dots span:nth-child(2) { animation-delay: 0.2s; }
        .dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 1; }
        }

        /* ── Input row ── */
        .input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(6, 6, 18, 0.82);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 11px 16px;
          transition: opacity 0.2s, transform 0.2s;
          backdrop-filter: blur(12px);
        }
        .input-row.hid { opacity: 0; pointer-events: none; transform: translateY(6px); }
        .input-row.vis { opacity: 1; transform: translateY(0); }

        .arr { color: #c4b5fd; font-size: 11px; }
        input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #eef0f5;
          font-family: 'Georgia', serif;
          font-size: clamp(13px, 1.8vw, 15px);
          caret-color: #c4b5fd;
        }
        input::placeholder { color: #2e2e42; }

        button {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #888;
          font-family: 'Georgia', serif;
          font-size: 12px;
          padding: 5px 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.06em;
        }
        button:hover  { border-color: #7dd3fc; color: #7dd3fc; }
        button:disabled { opacity: 0.2; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
