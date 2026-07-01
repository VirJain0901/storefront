"use client";

import { useState } from "react";

type Turn = { role: "user" | "assistant"; content: string };

export default function IntakeChat({ merchantId }: { merchantId: string }) {
  const [history, setHistory] = useState<Turn[]>([
    {
      role: "assistant",
      content: "Let's set up your store. First — what are you selling?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!input.trim() || sending) return;
    const nextHistory: Turn[] = [...history, { role: "user", content: input }];
    setHistory(nextHistory);
    setInput("");
    setSending(true);

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId, history: nextHistory }),
    });
    const data = await res.json();
    setHistory([...nextHistory, { role: "assistant", content: data.reply }]);
    setSending(false);
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl2 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {history.map((turn, i) => (
          <div
            key={i}
            className={`rounded-xl2 px-4 py-2 text-sm leading-relaxed max-w-[85%] ${
              turn.role === "assistant"
                ? "bg-cream self-start text-ink"
                : "bg-terracotta self-end text-white"
            }`}
          >
            {turn.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-bark/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your answer…"
        />
        <button
          onClick={send}
          disabled={sending}
          className="bg-terracotta text-white rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
