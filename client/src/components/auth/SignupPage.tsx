import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ShieldCheck, ArrowLeft, Send, TrendingUp, Shield, Zap, BarChart2, Globe, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ChatBot from '../ui/ChatBot';
import FloatingCryptoBackground from '../ui/FloatingCryptoBackground';
import { EMAILJS_CONFIG, isEmailJSConfigured } from '../../lib/emailjs';

// ── OTP Code Input ─────────────────────────────────────
interface CodeInputProps {
  length: number;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ length, value, onChange, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = digits.slice();
    arr[index] = char;
    const newVal = arr.join('');
    onChange(newVal);
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <div>
      <label className="block text-xs font-medium text-dark-300 mb-2">
        Verification Code
      </label>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-11 h-12 text-center text-lg font-bold rounded-xl border
              bg-dark-900/60 text-white outline-none transition-all duration-200
              focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple
              ${error ? 'border-accent-red/50' : 'border-white/10 hover:border-white/20'}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-accent-red text-center">{error}</p>
      )}
    </div>
  );
};

// ── Signup Page ─────────────────────────────────────────

type Step = 'details' | 'verify';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [step, setStep] = useState<Step>('details');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateDetails = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (!confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateAndSendCode = async () => {
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(newCode);
    setCode('');
    setCountdown(60);

    if (isEmailJSConfigured()) {
      try {
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          {
            to_email: email,
            to_name: name,
            verification_code: newCode,
          },
          EMAILJS_CONFIG.publicKey
        );
        toast.success(`Verification code sent to ${email}`, { duration: 4000, icon: '📧' });
      } catch (err: any) {
        console.error('EmailJS Error:', err);
        toast.error(`Email Error: ${err?.text || err?.message || 'Check console'}`, { duration: 5000 });
        toast(`Your code: ${newCode}`, { duration: 30000, icon: '🔑' });
      }
    } else {
      toast.success(`Verification code sent to ${email}`, { duration: 4000, icon: '📧' });
      toast(`Your code: ${newCode}`, { duration: 30000, icon: '🔑' });
    }
  };

  const handleSendCode = async () => {
    if (!validateDetails()) return;
    setSendingCode(true);
    await generateAndSendCode();
    setStep('verify');
    setSendingCode(false);
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (code.length < 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }
    if (code !== generatedCode) {
      setErrors({ code: 'Invalid code. Please try again.' });
      return;
    }
    setErrors({});
    try {
      await signup(name, email, password);
      navigate('/');
    } catch {
      // Error handled by store
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await generateAndSendCode();
  };

  const handleBack = () => {
    setStep('details');
    setCode('');
    setErrors({});
  };

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-accent-cyan" />,
      title: 'Advanced Analytics',
      description: 'Get deep insights into market trends with our real-time AI-driven analysis tools.',
    },
    {
      icon: <Zap className="w-6 h-6 text-accent-purple" />,
      title: 'Lightning Fast',
      description: 'Execute trades in milliseconds. Our 165Hz optimized engine ensures a lag-free experience.',
    },
    {
      icon: <Shield className="w-6 h-6 text-accent-green" />,
      title: 'Zero Risk Trading',
      description: 'Practice your strategies with our paper trading simulator without risking real capital.',
    },
    {
      icon: <Globe className="w-6 h-6 text-accent-blue" />,
      title: 'Global Markets',
      description: 'Access thousands of assets from global markets, all from one unified dashboard.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-dark-950 overflow-y-auto overflow-x-hidden text-white">
      {/* Background Elements */}
      <FloatingCryptoBackground />

      <div className="relative z-10">
        {/* Navigation / Header */}
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="Logo" 
              className="w-8 h-8" 
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-xl font-bold text-gradient">TradeOxx Ai</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-6 text-sm font-medium text-dark-300 mr-2">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            </div>
            <ChatBot />
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-10 pb-20 lg:pt-20 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse"></span>
                Next-Gen Trading
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                Master the Markets with <span className="text-gradient">TradeOxx Ai</span>
              </h1>
              <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                Experience the future of algorithmic paper trading. Professional-grade tools, lightning-fast execution, and zero financial risk.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-glass shadow-accent-cyan/20" onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Open an Account
                </Button>
                <a href="#features" className="text-sm font-semibold text-dark-200 hover:text-white transition-colors flex items-center gap-1">
                  Explore Features <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Signup Card */}
            <motion.div
              id="signup-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto lg:ml-auto"
            >
              <div className="bg-dark-800/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-glass relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                  <p className="text-sm text-dark-400">
                    {step === 'details' ? 'Join TradeOxx Ai today' : 'Verify your email'}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs text-center">
                    {error}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="space-y-4">
                        <Input
                          label="Full Name"
                          type="text"
                          placeholder="John Doe"
                          icon={<User className="w-4 h-4" />}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          error={errors.name}
                        />

                        <Input
                          label="Email"
                          type="email"
                          placeholder="you@example.com"
                          icon={<Mail className="w-4 h-4" />}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          error={errors.email}
                        />

                        <Input
                          label="Password"
                          type="password"
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          error={errors.password}
                        />

                        <Input
                          label="Confirm Password"
                          type="password"
                          placeholder="••••••••"
                          icon={<Lock className="w-4 h-4" />}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          error={errors.confirmPassword}
                        />

                        <Button type="submit" fullWidth size="lg" loading={sendingCode} icon={<Send className="w-4 h-4" />}>
                          Send Verification Code
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {step === 'verify' && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <form onSubmit={handleVerifyAndSignup} className="space-y-5">
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-900/60 border border-white/5">
                          <Mail className="w-4 h-4 text-accent-purple flex-shrink-0" />
                          <span className="text-xs text-dark-300 truncate">{email}</span>
                          <button
                            type="button"
                            onClick={handleBack}
                            className="ml-auto text-xs text-dark-400 hover:text-accent-purple transition-colors flex items-center gap-1"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Back
                          </button>
                        </div>

                        <div className="text-center">
                          <ShieldCheck className="w-10 h-10 text-accent-purple mx-auto mb-2 opacity-80" />
                          <p className="text-xs text-dark-400">
                            We sent a 6-digit verification code to
                            <br />
                            <span className="text-accent-purple font-medium">{email}</span>
                          </p>
                        </div>

                        <CodeInput
                          length={6}
                          value={code}
                          onChange={(val) => { setCode(val); setErrors({}); }}
                          error={errors.code}
                        />

                        <div className="text-center">
                          {countdown > 0 ? (
                            <span className="text-xs text-dark-500">
                              Resend code in <span className="text-accent-purple font-medium">{countdown}s</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResend}
                              className="text-xs text-accent-purple hover:text-accent-purple/80 font-medium transition-colors"
                            >
                              Resend Code
                            </button>
                          )}
                        </div>

                        <Button type="submit" fullWidth size="lg" loading={isLoading} icon={<UserPlus className="w-4 h-4" />}>
                          Verify & Create Account
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-6 text-center text-xs text-dark-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 border-y border-white/5 bg-dark-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose TradeOxx Ai?</h2>
              <p className="text-dark-300">We provide the most realistic, high-performance paper trading experience available on the market.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-dark-800/30 border border-white/5 rounded-2xl p-6 hover:bg-dark-800/50 hover:border-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-dark-900 border border-white/5 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <section id="platform" className="py-20 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">Designed for Professionals, Built for You</h2>
                <ul className="space-y-6 mb-8">
                  <li className="flex gap-4">
                    <div className="mt-1 w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shrink-0">
                      <BarChart2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Live Trading View</h4>
                      <p className="text-sm text-dark-400">Interact with robust charts featuring technical indicators, volume analysis, and historical data.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1 w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple shrink-0">
                      <Zap size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Ultra 165Hz Experience</h4>
                      <p className="text-sm text-dark-400">No more lag. Our UI is painstakingly optimized for 165Hz refresh rates ensuring a silky smooth feel.</p>
                    </div>
                  </li>
                </ul>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Join Now
                </Button>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/20 to-accent-cyan/20 blur-3xl rounded-full" />
                <img 
                  src={`${import.meta.env.BASE_URL}dashboard-mockup.png`} 
                  alt="Platform Preview" 
                  className="relative rounded-2xl border border-white/10 shadow-2xl shadow-accent-cyan/10 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 bg-dark-950">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="w-6 h-6 grayscale opacity-50" />
              <span className="text-sm font-semibold text-dark-400">TradeOxx Ai</span>
            </div>
            <p className="text-xs text-dark-500 text-center md:text-left">
              © 2026 TradeOxx Ai · Educational Paper Trading Simulator. Not real financial advice.
            </p>
            <div className="flex gap-4 text-xs font-medium text-dark-400">
              <Link to="#" className="hover:text-white transition-colors">Terms</Link>
              <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SignupPage;
