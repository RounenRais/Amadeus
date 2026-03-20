"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Emotion = "default" | "surprised" | "happy" | "angry" | "sad"| "blush";

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
    idle: ["CRS_JMD_40000600", "CRS_JMD_40000600"],
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
  const emotion: Emotion = (["default","surprised","happy","angry","sad","blush"] as Emotion[]).includes(raw as Emotion)
    ? (raw as Emotion) : "default";
  return { emotion, clean: text.replace(/\[EMOTION:\w+\]/gi, "").trim() };
}

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++;
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

const INTRO = "The Amadeus system is active. I'm built on Makise Kurisu's memory data. What would you like to add?";

export default function Home() {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [emotion, setEmotion]         = useState<Emotion>("default");
  const [currentSprite, setCurrentSprite] = useState("CRS_JMD_40000400");
  const [inputVisible, setInputVisible]   = useState(true);
  const [isTalking, setIsTalking]         = useState(false);

  const inputRef   = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const talkRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emotionRef = useRef<Emotion>("default");
  const talkingRef = useRef(false);
  emotionRef.current = emotion;
  talkingRef.current = isTalking;

  const { displayed, done } = useTypewriter(
    loading ? "" : currentText || (messages.length === 0 ? INTRO : ""),
    22
  );

  // Blink scheduler
  const scheduleBlink = useCallback(() => {
    if (blinkRef.current) clearTimeout(blinkRef.current);
    const delay = 3000 + Math.random() * 4000;
    blinkRef.current = setTimeout(() => {
      if (talkingRef.current || emotionRef.current === "happy") {
        scheduleBlink(); return;
      }
      setCurrentSprite(SPRITES[emotionRef.current].idle[1]);
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

  // Mouth animation
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
    } catch { setCurrentText("Bir hata oluştu."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (done) { setInputVisible(true); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [done]);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [messages]);

  const dialogueText = loading ? "" : currentText ? displayed : messages.length === 0 ? displayed : "";

  return (
    <div className="root">
      <div className="char-area">
        <img src={`/${currentSprite}.png`} alt="Amadeus" className={`char ${loading ? "idle" : ""}`} />
      </div>

      <div className="dlg-wrapper">
        {messages.length > 1 && (
          <div className="history-box" ref={historyRef}>
            {messages.slice(0, -1).map((m, i) => (
              <div key={i} className={`hline ${m.role}`}>
                <span className="hname">{m.role === "assistant" ? "Amadeus" : "Sen"}</span>
                <span className="htext " >{m.content}</span>
              </div>
            ))}
          </div>
        )}

        <div className="dlg-box">
          <div className="name-tag">Amadeus</div>
          <p className="dlg-text">
            {dialogueText}
            {!done && !loading && dialogueText && <span className="cur">▍</span>}
            {loading && <span className="dots"><span>.</span><span>.</span><span>.</span></span>}
          </p>
        </div>

        <div className={`input-row ${inputVisible ? "vis" : "hid"}`}>
          <span className="arr">▶</span>
          <input
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Bir şey yaz..." autoComplete="off"
          />
          <button onClick={sendMessage} disabled={loading}>Gönder</button>
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .root { width:100vw; height:100dvh; background:#0a0a12; display:flex; flex-direction:column; font-family:'Georgia',serif; overflow:hidden; }
        .char-area { flex:1; display:flex; align-items:flex-end; justify-content:center; overflow:hidden; min-height:0; }
        .char { height:100%; max-height:68vh; object-fit:contain; object-position:bottom center; mix-blend-mode:lighten; }
        .char.idle { animation:idle 3.5s ease-in-out infinite; }
        @keyframes idle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .dlg-wrapper { padding:0 16px 16px; max-width:900px; width:100%; margin:0 auto; display:flex; flex-direction:column; gap:8px; }
        .history-box { background:rgba(8,8,20,.8); border:1px solid rgba(255,255,255,.07); border-radius:4px; padding:8px 14px; max-height:76px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; scrollbar-width:none; }
        .history-box::-webkit-scrollbar { display:none; }
        .hline { display:flex; gap:10px; font-size:11px; opacity:.4; line-height:1.5; }
        .hname { min-width:52px; font-size:10px; font-weight:bold; letter-spacing:.08em; text-transform:uppercase; color:#7dd3fc; padding-top:1px; }
        .hline.user .hname { color:#c4b5fd; }
        .htext { color:#aaa; }
        .dlg-box { position:relative; background:rgba(8,8,20,.95); border:1px solid rgba(255,255,255,.1); border-radius:4px; padding:20px 22px 16px; min-height:90px; }
        .name-tag { position:absolute; top:-13px; left:18px; background:#0a0a12; border:1px solid rgba(125,211,252,.45); color:#7dd3fc; font-size:11px; font-weight:bold; letter-spacing:.15em; text-transform:uppercase; padding:2px 10px; border-radius:2px; }
        .dlg-text { font-size:clamp(13px,2.2vw,15px); line-height:1.8; color:#e8e8e8; min-height:50px; }
        .cur { color:#7dd3fc; animation:blink .65s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .dots span { color:#7dd3fc; animation:pulse 1.2s ease-in-out infinite; }
        .dots span:nth-child(2){animation-delay:.2s} .dots span:nth-child(3){animation-delay:.4s}
        @keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:1} }
        .input-row { display:flex; align-items:center; gap:10px; background:rgba(8,8,20,.95); border:1px solid rgba(255,255,255,.08); border-radius:4px; padding:10px 14px; transition:opacity .25s,transform .25s; }
        .input-row.hid { opacity:0; pointer-events:none; transform:translateY(4px); }
        .input-row.vis { opacity:1; transform:translateY(0); }
        .arr { color:#c4b5fd; font-size:10px; }
        input { flex:1; background:transparent; border:none; outline:none; color:#e8e8e8; font-family:'Georgia',serif; font-size:clamp(13px,2vw,15px); caret-color:#c4b5fd; }
        input::placeholder { color:#2a2a3a; }
        button { background:transparent; border:1px solid rgba(255,255,255,.12); color:#888; font-family:'Georgia',serif; font-size:12px; padding:5px 12px; border-radius:3px; cursor:pointer; transition:all .2s; letter-spacing:.05em; }
        button:hover { border-color:#7dd3fc; color:#7dd3fc; }
        button:disabled { opacity:.2; cursor:not-allowed; }
      `}</style>
    </div>
  );
}
