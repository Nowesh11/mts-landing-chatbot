"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const WELCOME_MESSAGE =
  "Hi, I'm Harry — MT Smart Industries' assistant. I can help answer questions about our waste and resource management services, sustainability approach, certifications, and how to get in touch. What would you like to know?";

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "Do you handle food waste?",
  "How do I request a quote?",
];

// Shown as an auto-appearing bubble near the launcher a few seconds after
// page load, before the user has ever opened the chat — solves the
// discoverability problem (previously the only affordance was a subtle
// pulse ring around the button, easy for a first-time visitor to miss
// entirely).
const ATTENTION_BUBBLE_TEXT = "👋 Hi! Need help? Chat with Harry";
const ATTENTION_BUBBLE_DELAY_MS = 4000;
const ATTENTION_BUBBLE_AUTO_HIDE_MS = 9000;

function uid() {
  return Math.random().toString(36).slice(2);
}

// Circular-cropped avatar, generated directly on the brand navy background
// so it drops in with no transparency handling needed. `statusDot` overlaps
// a small pulsing "online" badge on the bottom-right edge, matching a
// standard profile-picture presence indicator. `glow` adds the site's
// drop-shadow-not-flat depth treatment for the larger header placement.
function HarryAvatar({
  size = 32,
  statusDot = false,
  glow = false,
  ring = false,
}: {
  size?: number;
  statusDot?: boolean;
  glow?: boolean;
  /** Thin lime border — header only, per design; message bubbles and the
   * launcher render the avatar edge-to-edge with no border. */
  ring?: boolean;
}) {
  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        filter: glow
          ? "drop-shadow(0 6px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 14px rgba(198,217,46,0.12))"
          : undefined,
      }}
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-full bg-navy ${
          ring ? "border border-lime/60" : ""
        }`}
      >
        <Image
          src="/images/harry-avatar.png"
          alt="Harry"
          fill
          sizes={`${size}px`}
          className="scale-[1.14] object-cover"
        />
      </div>
      {statusDot && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-navy ring-2 ring-navy">
          <motion.span
            className="absolute h-full w-full rounded-full bg-lime"
            animate={{ opacity: [0.55, 0.15, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="relative h-1.5 w-1.5 rounded-full bg-lime" />
        </span>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <HarryAvatar size={28} />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-lime/10 bg-surface px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-lime"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-lime px-4 py-2.5 text-sm leading-relaxed text-navy"
      >
        {message.content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex max-w-[85%] items-end gap-2"
    >
      <HarryAvatar size={28} />
      <div
        className={`rounded-2xl rounded-bl-sm border px-4 py-2.5 text-sm leading-relaxed ${
          message.isError
            ? "border-red-400/25 bg-red-500/[0.06] text-red-200/90"
            : "border-lime/10 bg-surface text-offwhite"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAttentionBubble, setShowAttentionBubble] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Discoverability: auto-show a small "Hi! Need help?" bubble near the
  // launcher a few seconds after page load, before the visitor has ever
  // interacted with it — the pulse ring alone was easy to miss entirely.
  // Auto-hides itself after a while so it doesn't linger forever if
  // ignored, and is dismissed immediately (and never shown again this
  // session) the moment the user actually opens the chat.
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowAttentionBubble(true);
    }, ATTENTION_BUBBLE_DELAY_MS);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showAttentionBubble) return;
    const hideTimer = setTimeout(() => {
      setShowAttentionBubble(false);
    }, ATTENTION_BUBBLE_AUTO_HIDE_MS);
    return () => clearTimeout(hideTimer);
  }, [showAttentionBubble]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowAttentionBubble(false);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
      welcomeTimeoutRef.current = setTimeout(() => {
        setMessages([{ id: uid(), role: "assistant", content: WELCOME_MESSAGE }]);
        setShowWelcome(true);
      }, 500);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      handleOpen();
    }
  };

  // Exposed globally so other components (the navbar's chat icon button,
  // any other future "chat with us" link elsewhere on the page) can open
  // the widget directly without needing this component's internal state
  // lifted into a shared context/provider — same lightweight pattern
  // already used for window.__lenis in SmoothScrollProvider.
  useEffect(() => {
    window.__openChat = handleOpen;
    return () => {
      window.__openChat = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOpenedOnce]);

  useEffect(() => {
    return () => {
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      // Let the open transition start before stealing focus.
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setShowWelcome(false);
    const userMessage: ChatMessage = { id: uid(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      if (typeof data?.reply !== "string") throw new Error("Malformed response");

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Sorry, something went wrong — please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showChips = showWelcome && messages.length === 1;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Auto-appearing attention bubble — only ever shown before the
            chat has been opened for the first time. */}
        <AnimatePresence>
          {showAttentionBubble && !isOpen && !hasOpenedOnce && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{ transformOrigin: "bottom right" }}
              className="absolute bottom-[calc(100%+12px)] right-0 w-max max-w-[220px] rounded-2xl rounded-br-sm border border-lime/20 bg-surface px-4 py-3 text-sm text-offwhite shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            >
              <button
                type="button"
                onClick={() => setShowAttentionBubble(false)}
                aria-label="Dismiss"
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-lime/20 bg-navy text-slate transition-colors hover:text-offwhite"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
              {ATTENTION_BUBBLE_TEXT}
            </motion.div>
          )}
        </AnimatePresence>

        {!hasOpenedOnce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-lime/60"
            animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.button
          type="button"
          onClick={handleToggle}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          aria-label={isOpen ? "Close chat with Harry" : "Chat with Harry"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface text-lime shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors hover:bg-surface/80"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} strokeWidth={2} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="relative flex h-11 w-11 items-center justify-center"
              >
                <div className="relative h-full w-full overflow-hidden rounded-full bg-navy">
                  <Image
                    src="/images/harry-avatar.png"
                    alt=""
                    fill
                    sizes="44px"
                    className="scale-[1.14] object-cover"
                  />
                </div>
                {/* Small chat-affordance badge — without this the avatar
                    alone could read as a static profile picture rather
                    than an interactive launcher. */}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-navy bg-lime text-navy">
                  <MessageCircle size={11} strokeWidth={2.5} />
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden border border-lime/10 bg-navy shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[80vh] sm:w-[400px] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-lime/10 bg-surface/40 px-4 py-4">
              <HarryAvatar size={40} statusDot glow ring />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-sm font-semibold text-offwhite">
                  Harry
                </h2>
                <p className="truncate text-xs text-slate">
                  MT Smart Industries Assistant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate transition-colors hover:bg-offwhite/5 hover:text-offwhite"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {showChips && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="ml-9 flex flex-wrap gap-2"
                >
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-full border border-lime/30 px-3 py-1.5 text-xs text-offwhite/80 transition-colors hover:border-lime hover:text-lime"
                    >
                      {q}
                    </button>
                  ))}
                </motion.div>
              )}

              {isTyping && <TypingIndicator />}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 border-t border-lime/10 bg-surface/20 p-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder="Ask Harry anything..."
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-2xl border border-lime/10 bg-navy/60 px-4 py-2.5 text-sm text-offwhite placeholder-slate outline-none transition-colors focus:border-lime/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-navy transition-opacity disabled:opacity-40"
              >
                <Send size={16} strokeWidth={2} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}