import { MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type Msg = { sender: "user" | "bot"; text: string };

export const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && boxRef.current) {
      // small scenic welcome message
      if (messages.length === 0) {
        setMessages([
          { sender: "bot", text: "Hello! I can help with flood alerts, reporting and safety advice." },
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    // add user message
    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chatbot/query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        setMessages((m) => [...m, { sender: "bot", text: `Error: ${resp.status} ${txt}` }]);
      } else {
        const data = await resp.json();
        const answer = data.answer ?? "No response.";
        setMessages((m) => [...m, { sender: "bot", text: answer }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { sender: "bot", text: `Network error: ${e?.message ?? e}` }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl z-50 bg-gradient-accent"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
          <div className="bg-gradient-primary text-primary-foreground p-4 rounded-t-lg">
            <h3 className="font-semibold">BlueGuard AI Assistant</h3>
            <p className="text-xs opacity-90">How can I help you today?</p>
          </div>
          <div ref={boxRef} className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.sender === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-left text-xs text-muted-foreground">Thinking...</div>}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Chat input"
              />
              <Button size="sm" variant="accent" onClick={sendMessage} disabled={loading}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
