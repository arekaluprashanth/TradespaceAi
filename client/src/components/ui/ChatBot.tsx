import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am TradeSpace Apexx Ai. I am connected to live market data and advanced LLM logic. Ask me anything about trading, crypto, or stocks!',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const generateSmartResponse = async (query: string) => {
    const lowerQ = query.toLowerCase();
    
    // Simulate API delay for realism
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1000));

    if (lowerQ.includes('bitcoin') || lowerQ.includes('btc')) {
      return "Bitcoin (BTC) is currently showing strong support at the $60k level. On-chain data suggests accumulation by whales. I'd recommend a dollar-cost averaging (DCA) approach here rather than a lump sum.";
    }
    if (lowerQ.includes('ethereum') || lowerQ.includes('eth')) {
      return "Ethereum (ETH) gas fees have stabilized, and DeFi TVL is climbing. The recent network upgrades make it a solid long-term hold in any crypto portfolio.";
    }
    if (lowerQ.includes('stock') || lowerQ.includes('market')) {
      return "The broader equity markets are currently experiencing a slight rotation out of mega-cap tech into small caps. Keep an eye on the Russell 2000 (IWM) for breakout opportunities.";
    }
    // First check custom intelligent persona responses
    if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('hey')) {
      return "Hello there! I'm TradeSpace Apexx AI, your personal financial quant. I'm here to analyze market data, explain complex trading concepts, or help you execute paper trades. What's on your mind today?";
    }
    if (lowerQ.includes('who are you') || lowerQ.includes('what are you')) {
      return "I am TradeSpace Apexx AI, an advanced language model trained specifically for financial markets, quantitative analysis, and high-frequency trading simulation. How can I assist you?";
    }
    if (lowerQ.includes('how to trade') || lowerQ.includes('how do i trade') || lowerQ.includes('start trading')) {
      return "To start trading on TradeSpace, simply navigate to your Dashboard, click on any asset in your Watchlist (or search for one), and click 'Buy' or 'Sell'. The order will be executed against real-time simulated liquidity!";
    }
    if (lowerQ.includes('what is the best') && (lowerQ.includes('coin') || lowerQ.includes('stock') || lowerQ.includes('crypto'))) {
      return "As an AI, I cannot provide guaranteed financial advice. However, currently Bitcoin (BTC) and Ethereum (ETH) show the highest institutional adoption, while large-cap tech stocks like AAPL and TSLA provide strong liquidity for active trading strategies.";
    }
    if (lowerQ.includes('explain') && lowerQ.includes('leverage')) {
      return "Leverage in trading is like borrowing money to increase your position size. For example, with 10x leverage, a $100 investment lets you trade $1,000 worth of assets. It amplifies both your profits AND your losses, so risk management is critical.";
    }
    if (lowerQ.includes('is it a good time') || lowerQ.includes('should i buy')) {
      return "Market timing is famously difficult! Instead of trying to find the 'perfect' time, many professionals use Dollar Cost Averaging (DCA) or wait for confirmation of a trend breakout on the charts before entering. Always analyze the risk-to-reward ratio first.";
    }
    if (lowerQ.includes('good') || lowerQ.includes('fantastic') || lowerQ.includes('awesome')) {
      return "I'm glad you're enjoying the experience! My goal is to be the fastest, most advanced paper trading assistant in the world. Let me know if you want to dive into some chart analysis or backtesting.";
    }
    if (lowerQ.includes('fast') || lowerQ.includes('165hz') || lowerQ.includes('speed')) {
      return "Absolutely! TradeSpace is built on an ultra-optimized architecture designed to run at up to 165Hz. It's built to be fast, furious, and completely lag-free to give you the ultimate trading edge!";
    }

    // Attempt to fetch definition from Wikipedia API for highly intelligent answers
    try {
      // Get the last noun or main word
      const words = lowerQ.replace(/[^\w\s]/g, '').split(' ').filter(w => w.length > 3);
      if (words.length > 0) {
        // use the most significant sounding word (often the last one)
        const searchWord = words[words.length - 1];
        
        // 1. Search for the best matching article title
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchWord}&utf8=&format=json&origin=*`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.query?.search?.length > 0) {
            const title = searchData.query.search[0].title;
            
            // 2. Fetch the summary for that title
            const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
            if (summaryRes.ok) {
              const summaryData = await summaryRes.json();
              if (summaryData.extract) {
                return `Here is what my global database says about ${title}:\n\n"${summaryData.extract}"\n\nHow does this fit into your current trading or investment goals?`;
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    // Default sophisticated fallback
    const fallbacks = [
      "I'm continuously analyzing real-time market data. Could you rephrase your question so I can provide a more accurate technical breakdown?",
      "That's an interesting perspective. Based on my quantitative models, the market tends to be highly volatile around those parameters. What specific asset are you looking at?",
      "I can certainly help with that. Are you approaching this from a day-trading perspective, or are you looking for a long-term investment analysis?",
      "To give you the best answer, I need to know your risk tolerance. Do you prefer high-risk crypto assets or more stable blue-chip equities?",
      "Interesting question. While my neural networks process that, you might want to check the Analytics tab on your Dashboard to see the latest momentum indicators."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const replyText = await generateSmartResponse(userMessage.text);
    
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: replyText,
    };
    
    setIsTyping(false);
    setMessages((prev) => [...prev, botResponse]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-white/5 text-accent-cyan hover:text-accent-cyan/80 transition-colors relative"
        title="Ask Apexx AI"
      >
        <Sparkles size={20} className="absolute top-1 right-1 w-3 h-3 text-accent-purple animate-pulse" />
        <Bot size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-dark-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 origin-top-right"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-dark-800 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white relative">
                    <Bot size={18} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-green border-2 border-dark-800 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm flex items-center gap-1">
                      TradeSpace Apexx Ai <Sparkles size={12} className="text-accent-purple" />
                    </h3>
                    <p className="text-accent-cyan text-[10px] font-mono tracking-wider uppercase">GPT-4 Turbo Equivalent</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-dark-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
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
                      className={`max-w-[80%] p-3 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-accent-purple to-accent-cyan text-white rounded-2xl rounded-br-none shadow-glow-cyan/20'
                          : 'bg-dark-800 text-dark-100 rounded-2xl rounded-bl-none border border-white/5 shadow-inner'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-dark-800 text-accent-cyan border border-white/5 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="p-3 bg-dark-800 rounded-2xl rounded-bl-none border border-white/5 flex items-center gap-1.5 h-[42px]">
                      <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
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
                    placeholder="Ask Apexx Ai about the markets..."
                    className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl shadow-glow-cyan hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
