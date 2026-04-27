import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPaperAirplane, HiRefresh } from 'react-icons/hi';

// ─── Routes where the chatbot should NOT appear ────────────────────────────
const HIDDEN_ROUTES = [
  '/login',
  '/register',
  '/reset-password',
  '/dashboard',
  '/write',
  '/community/zerotrace-arena-ctf-1',
];

const STORAGE_KEY = 'zerotrace_chat_history';
const SUPABASE_FUNCTION_URL =
  'https://hklbzynfekyymrdqlhiv.supabase.co/functions/v1/chat-ai';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "👋 Hi! I'm the **ZeroTrace AI Assistant**. I can help you learn about our cybersecurity services (SOC, VAPT, Red Teaming, and more), AI solutions, community events, blog, and how to get in touch with the team.\n\nWhat would you like to know?",
  id: 'welcome',
};

// Simple markdown-ish renderer for bold/code/links in bot messages
function BotMessageContent({ content }) {
  // Process **bold**, `code`, and line breaks
  const lines = content.split('\n');
  return (
    <div className="zt-chat-message-text">
      {lines.map((line, li) => {
        // Split on **bold** and `code`
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pi}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={pi} className="zt-chat-inline-code">{part.slice(1, -1)}</code>;
              }
              return <span key={pi}>{part}</span>;
            })}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </div>
  );
}

// Typing indicator dots
function TypingIndicator() {
  return (
    <div className="zt-chat-bubble zt-chat-bubble-bot zt-typing-indicator">
      <span className="zt-dot" style={{ animationDelay: '0ms' }} />
      <span className="zt-dot" style={{ animationDelay: '160ms' }} />
      <span className="zt-dot" style={{ animationDelay: '320ms' }} />
    </div>
  );
}

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Hide on restricted routes
  const isHidden =
    HIDDEN_ROUTES.some((r) => location.pathname === r) ||
    location.pathname.startsWith('/edit/');

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasNewMessage(false);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleClear = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', content: trimmed, id: `u-${Date.now()}` };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMsg = {
        role: 'assistant',
        content: data.reply,
        id: `a-${Date.now()}`,
      };
      setMessages((prev) => [...prev, botMsg]);

      // If panel closed, show badge
      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ Sorry, I encountered an error. Please try again or contact us at **contact@zerotrace.in**.',
          id: `err-${Date.now()}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isHidden) return null;

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <div className="zt-chat-trigger-container">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="chat-trigger"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={handleOpen}
              id="zerotrace-chat-open"
              aria-label="Open ZeroTrace AI Chat"
              className="zt-chat-trigger"
            >
              {/* Pulse rings */}
              <span className="zt-pulse-ring zt-pulse-ring-1" />
              <span className="zt-pulse-ring zt-pulse-ring-2" />

              {/* Icon */}
              <span className="zt-chat-trigger-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>

              <span className="zt-chat-trigger-label">ZT AI</span>

              {/* Unread badge */}
              {hasNewMessage && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="zt-unread-badge"
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Chat Panel ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              ref={panelRef}
              className="zt-chat-panel"
              role="dialog"
              aria-label="ZeroTrace AI Chat"
            >
              {/* Header */}
              <div className="zt-chat-header">
                <div className="zt-chat-header-left">
                  <div className="zt-chat-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <div className="zt-chat-title">ZeroTrace AI</div>
                    <div className="zt-chat-status">
                      <span className="zt-status-dot" />
                      Online · Scoped to ZeroTrace
                    </div>
                  </div>
                </div>
                <div className="zt-chat-header-actions">
                  <button
                    onClick={handleClear}
                    aria-label="Clear chat"
                    title="Clear chat history"
                    className="zt-chat-header-btn"
                  >
                    <HiRefresh size={16} />
                  </button>
                  <button
                    onClick={handleClose}
                    aria-label="Close chat"
                    className="zt-chat-header-btn"
                    id="zerotrace-chat-close"
                  >
                    <HiX size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="zt-chat-messages">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`zt-chat-message-row ${msg.role === 'user' ? 'zt-chat-message-row-user' : 'zt-chat-message-row-bot'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="zt-chat-bot-avatar">ZT</div>
                    )}
                    <div
                      className={`zt-chat-bubble ${
                        msg.role === 'user' ? 'zt-chat-bubble-user' : 'zt-chat-bubble-bot'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <BotMessageContent content={msg.content} />
                      ) : (
                        <div className="zt-chat-message-text">{msg.content}</div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="zt-chat-message-row zt-chat-message-row-bot"
                  >
                    <div className="zt-chat-bot-avatar">ZT</div>
                    <TypingIndicator />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="zt-chat-input-area">
                <div className="zt-chat-input-row">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about ZeroTrace services..."
                    rows={1}
                    disabled={isLoading}
                    className="zt-chat-input"
                    id="zerotrace-chat-input"
                    aria-label="Chat message input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="zt-chat-send-btn"
                    id="zerotrace-chat-send"
                    aria-label="Send message"
                  >
                    <HiPaperAirplane size={18} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                </div>
                <div className="zt-chat-footer-note">
                  Answers scoped to ZeroTrace only · <a href="/contact" className="zt-chat-contact-link">contact@zerotrace.in</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
