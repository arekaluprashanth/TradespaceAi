import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am TradeSpace Apexx Ai. How can I help you dominate the markets today?',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Mock AI response delay
    setTimeout(() => {
      const responses = [
        "Based on my analysis, volatility is increasing. Consider tight stop-losses.",
        "The current market trend suggests a bullish reversal in the tech sector.",
        "That's a great question. Historically, this pattern indicates a consolidation phase.",
        "As an AI, I see patterns you might miss. The volume profile is shifting positively.",
        "I recommend checking the Portfolio Dashboard to see how this affects your current holdings.",
      ];
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Chat with TradeSpace Apexx Ai"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-full shadow-glow-cyan flex items-center justify-center text-white z-[60] hover:scale-110 transition-transform"
      >
        <Bot size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[70vh] bg-dark-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[70]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-dark-800 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">TradeSpace Apexx Ai</h3>
                  <p className="text-accent-cyan text-xs">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-dark-700 text-white'
                        : 'bg-dark-800 text-accent-cyan border border-white/5'
                    }`}
                  >
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-accent-purple text-white rounded-br-none'
                        : 'bg-dark-800 text-dark-100 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark-800 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Apexx Ai..."
                  className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent-cyan/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
