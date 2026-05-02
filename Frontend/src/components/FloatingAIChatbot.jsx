import { useState } from "react";
import { Bot, X, Send } from "lucide-react";
import api from "../lib/api";

const FloatingAIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I am your AI Research Assistant. Ask me anything about research, projects, datasets, funding, or collaboration.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMessage = { sender: "user", text: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const res = await api.post("/ai/chat", {
        message: userText,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.data.reply || "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-6 z-[9999] w-[360px] max-w-[calc(100vw-32px)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="font-semibold text-sm">AI Research Assistant</h3>
                <p className="text-xs text-blue-100">Powered by Hugging Face</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-blue-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-sm text-slate-500">
                  AI is typing...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:bg-blue-700 transition"
      >
        {open ? <X size={24} /> : <Bot size={26} />}
      </button>
    </>
  );
};

export default FloatingAIChatbot;