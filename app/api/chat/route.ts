import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
    }

    const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Sen kuantum fiziği konusunda uzman bir asistansın.", // karakterini buradan belirle
          },
          ...messages, 
        ],
        max_tokens: 1024,
      }),
    });

    const data = await r.json();
    const result = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ result });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}