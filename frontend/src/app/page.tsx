"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  Star,
  ChevronDown,
  Menu,
  X,
  Activity,
  Globe,
  PieChart,
  MessageSquare,
  Share2,
  Mail
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
          isScrolled
            ? "bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Tradespace<span className="text-emerald-500 dark:text-emerald-400">AI</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Solutions", "Testimonials", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log in
            </button>
            <button className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-white/10 flex items-center gap-2 group">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {["Features", "Solutions", "Testimonials", "Pricing"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                <button className="w-full py-2 text-left text-sm font-medium text-slate-600 dark:text-slate-300">
                  Log in
                </button>
                <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium text-center">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-cyan-500/20 dark:bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              TradespaceAI Engine v2.0 is live
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
            >
              Trade the Future with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                AI Precision
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Institutional-grade algorithms, real-time market data, and predictive analytics built for modern investors. Outperform the market while you sleep.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-lg hover:scale-105 transition-transform shadow-xl shadow-slate-900/20 dark:shadow-white/10">
                Start Trading Now
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Live Demo
              </button>
            </motion.div>
          </div>

          {/* Mock Chart Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full max-w-5xl mx-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-emerald-400" />
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold">Portfolio Performance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI-Managed Growth Fund</p>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$142,854.20</h3>
                <p className="text-sm font-medium text-emerald-500 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" /> +24.8% (YTD)
                </p>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-1 sm:gap-2">
              {[30, 45, 40, 60, 55, 75, 70, 85, 80, 95, 90, 110, 105, 120, 115, 130, 125, 145].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: "0%" }}
                  animate={{ height: `${(h / 150) * 100}%` }}
                  transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                  className="w-full rounded-t-sm md:rounded-t-md bg-gradient-to-t from-emerald-500/20 to-emerald-400/80 dark:from-emerald-900/40 dark:to-emerald-400"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-10 border-y border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
            Trusted by innovative financial institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Vanguard', 'BlackRock', 'Fidelity', 'Coinbase', 'Binance'].map(logo => (
              <span key={logo} className="text-xl md:text-2xl font-bold font-serif text-slate-800 dark:text-slate-200">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Smarter tools for better returns</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Our platform combines military-grade encryption with state-of-the-art machine learning models to optimize your trades in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: "Ultra-fast Execution",
                desc: "Sub-millisecond trade execution ensures you never miss a market opportunity.",
                bg: "bg-amber-100 dark:bg-amber-500/10"
              },
              {
                icon: <Activity className="w-6 h-6 text-emerald-500" />,
                title: "Algorithmic Strategies",
                desc: "Deploy pre-built AI strategies or create custom ones using our visual builder.",
                bg: "bg-emerald-100 dark:bg-emerald-500/10"
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-500" />,
                title: "Bank-Grade Security",
                desc: "Your assets are protected by MPC cryptography and cold storage solutions.",
                bg: "bg-blue-100 dark:bg-blue-500/10"
              },
              {
                icon: <Globe className="w-6 h-6 text-indigo-500" />,
                title: "Global Markets",
                desc: "Trade across 50+ exchanges worldwide from a single unified interface.",
                bg: "bg-indigo-100 dark:bg-indigo-500/10"
              },
              {
                icon: <PieChart className="w-6 h-6 text-purple-500" />,
                title: "Smart Rebalancing",
                desc: "Automatically adjust your portfolio to maintain target allocations.",
                bg: "bg-purple-100 dark:bg-purple-500/10"
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-pink-500" />,
                title: "Predictive Analytics",
                desc: "Anticipate market movements with our proprietary sentiment analysis engine.",
                bg: "bg-pink-100 dark:bg-pink-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", feature.bg)}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Loved by traders worldwide</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our community has to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Jenkins",
                role: "Day Trader",
                content: "TradespaceAI completely transformed my portfolio. The predictive analytics caught the last market dip 2 days before it happened.",
                stars: 5
              },
              {
                name: "Michael Chen",
                role: "Fund Manager",
                content: "The institutional-grade tools packed into this intuitive UI is mind-blowing. It's like having a team of quants working for you 24/7.",
                stars: 5
              },
              {
                name: "Elena Rodriguez",
                role: "Retail Investor",
                content: "I used to spend hours analyzing charts. Now, the AI does the heavy lifting and I just review and approve the automated strategies.",
                stars: 5
              }
            ].map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(test.stars)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-8 text-lg leading-relaxed">"{test.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{test.name}</h4>
                    <p className="text-sm text-slate-400">{test.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$0",
                desc: "Perfect for beginners getting started with AI trading.",
                features: ["Manual trading interface", "Basic market data", "Up to $10k portfolio tracking", "Community support"],
                popular: false,
                button: "Start Free"
              },
              {
                name: "Pro",
                price: "$49",
                period: "/mo",
                desc: "Advanced tools for serious retail investors.",
                features: ["3 automated AI strategies", "Real-time premium data", "Unlimited portfolio tracking", "Priority 24/7 support", "Custom alerts"],
                popular: true,
                button: "Start 14-Day Trial"
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "Institutional grade features for funds and whales.",
                features: ["Unlimited AI strategies", "API access (1000 req/s)", "Dedicated account manager", "Custom model training", "OTC desk access"],
                popular: false,
                button: "Contact Sales"
              }
            ].map((tier, i) => (
              <div
                key={i}
                className={cn(
                  "relative rounded-3xl p-8 border",
                  tier.popular
                    ? "bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white shadow-2xl scale-100 md:scale-105 z-10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className={cn("text-sm mb-6 h-10", tier.popular ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                  {tier.desc}
                </p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  {tier.period && <span className={cn(tier.popular ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>{tier.period}</span>}
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className={cn("w-5 h-5 shrink-0", tier.popular ? "text-emerald-400" : "text-emerald-500")} />
                      <span className={cn("text-sm", tier.popular ? "text-slate-200" : "text-slate-600 dark:text-slate-300")}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={cn(
                    "w-full py-3 rounded-xl font-bold transition-all",
                    tier.popular
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                  )}
                >
                  {tier.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to know about TradespaceAI.</p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "How does the AI trading engine work?",
                a: "Our AI engine analyzes millions of data points across market sentiment, historical price action, and macroeconomic indicators in real-time to predict short and medium-term price movements with high probability."
              },
              {
                q: "Are my funds secure?",
                a: "Yes. TradespaceAI uses non-custodial API integrations, meaning we never have direct access to your funds. All API keys are encrypted using AES-256 and stored in secure enclaves."
              },
              {
                q: "Can I use my own trading strategies?",
                a: "Absolutely! The Pro and Enterprise tiers include a visual strategy builder where you can define custom parameters, backtest against historical data, and deploy instantly."
              },
              {
                q: "What exchanges are supported?",
                a: "We currently support 50+ major exchanges including Binance, Coinbase Pro, Kraken, FTX, and decentralized exchanges like Uniswap and SushiSwap."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-lg">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:-rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600 dark:bg-emerald-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/50 to-emerald-500/50" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to dominate the market?</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join thousands of traders who are already using TradespaceAI to achieve consistent, superior returns.
          </p>
          <button className="px-8 py-4 rounded-full bg-white text-emerald-900 font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                  <TrendingUp className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">Tradespace<span className="text-emerald-500 dark:text-emerald-400">AI</span></span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8">
                The most advanced algorithmic trading platform for modern investors. Trade smarter, not harder.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-emerald-500 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-emerald-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-emerald-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                {["Features", "Integrations", "Pricing", "Changelog", "Docs"].map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Blog", "Contact", "Partners"].map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4">
                {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Cookie Policy"].map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © 2026 TradespaceAI. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
