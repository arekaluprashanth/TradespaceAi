import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, TrendingUp, Shield, Zap, BarChart2, Globe, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ChatBot from '../ui/ChatBot';
import FloatingCryptoBackground from '../ui/FloatingCryptoBackground';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 4) e.password = 'Password too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error is already set in store
    }
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
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-glass shadow-accent-cyan/20" onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Start Trading Now
                </Button>
                <a href="#features" className="text-sm font-semibold text-dark-200 hover:text-white transition-colors flex items-center gap-1">
                  Explore Features <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>

            {/* Right Column: Login Card */}
            <motion.div
              id="login-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto lg:ml-auto"
            >
              <div className="bg-dark-800/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-glass relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
                
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-sm text-dark-400">Sign in to your dashboard</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <div className="flex items-center justify-end">
                    <Link to="/forgot-password" className="text-xs text-dark-400 hover:text-accent-cyan transition-colors">
                      Forgot Password?
                    </Link>
                  </div>

                  <Button type="submit" fullWidth size="lg" loading={isLoading} icon={<LogIn className="w-4 h-4" />}>
                    Sign In
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs text-dark-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors">
                    Create Account
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
                <Button variant="outline" size="lg" onClick={() => document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Access Platform
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

export default LoginPage;
