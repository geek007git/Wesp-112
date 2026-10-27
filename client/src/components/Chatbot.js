import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import http, { apiError } from "../api/http";
import "../styles/Chatbot.css";

const starterMessage = {
  role: "assistant",
  content: "Hi! I'm MediMate. I can help you find the right doctor, book a visit, or understand your appointments. How can I help?",
};

const suggestions = [
  { label: "Find a doctor", message: "Help me find a doctor" },
  { label: "Book a visit", message: "How do I book an appointment?" },
  { label: "My appointments", message: "Show me how to check my appointments" },
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const sendMessage = async (text) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const nextMessages = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await http.post("/chat/message", {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: apiError(error) || "I couldn't respond just now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    if (suggestion.label === "Find a doctor") {
      setOpen(false);
      navigate("/");
      return;
    }
    if (suggestion.label === "My appointments") {
      setOpen(false);
      navigate("/appointments");
      return;
    }
    sendMessage(suggestion.message);
  };

  return (
    <div className="chatbot-shell">
      {open && (
        <section className="chatbot-panel" aria-label="MediMate assistant">
          <header className="chatbot-header">
            <div className="chatbot-avatar" aria-hidden="true">✦</div>
            <div>
              <strong>MediMate</strong>
              <span><i /> AI appointment assistant</span>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
          </header>

          <div className="chatbot-messages" aria-live="polite">
            <div className="chatbot-day">Today</div>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chatbot-row ${message.role}`}>
                {message.role === "assistant" && <div className="chatbot-mini-avatar">✦</div>}
                <div className="chatbot-bubble">{message.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-row assistant">
                <div className="chatbot-mini-avatar">✦</div>
                <div className="chatbot-bubble typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length < 3 && (
            <div className="chatbot-suggestions">
              {suggestions.map((suggestion) => (
                <button key={suggestion.label} onClick={() => handleSuggestion(suggestion)}>
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(input); }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1000}
              placeholder="Ask MediMate anything..."
              aria-label="Message MediMate"
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send message">➤</button>
          </form>
          <p className="chatbot-disclaimer">For guidance only — not a medical diagnosis.</p>
        </section>
      )}

      <button
        className={`chatbot-launcher ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close MediMate" : "Open MediMate"}
        aria-expanded={open}
      >
        <span className="launcher-icon">{open ? "×" : "✦"}</span>
        {!open && <span className="launcher-label"><strong>Ask MediMate</strong><small>AI appointment assistant</small></span>}
      </button>
    </div>
  );
};

export default Chatbot;
