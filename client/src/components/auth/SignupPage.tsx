import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { EMAILJS_CONFIG, isEmailJSConfigured } from '../../lib/emailjs';

// ── Floating Particle ──────────────────────────────────

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const ParticleField: React.FC = () => {
  const particles: ParticleConfig[] = useMemo(() => {
    const colors = [
      'rgba(168, 85, 247, 0.3)',
      'rgba(0, 212, 255, 0.25)',
      'rgba(16, 185, 129, 0.2)',
      'rgba(168, 85, 247, 0.15)',
    ];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      color: colors[i % colors.length],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{
            y: [0, -60, -120, -60, 0],
            x: [0, -30, 20, -40, 0],
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0.5, 1, 0.7, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating orbs */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full blur-[120px] opacity-15"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)', left: '15%', top: '30%' }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[120px] opacity-15"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)', right: '15%', bottom: '25%' }}
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

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

  // Countdown timer for resend
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
        toast.success(
          `Verification code sent to ${email}`,
          { duration: 4000, icon: '📧' }
        );
      } catch (err: any) {
        console.error('EmailJS Error:', err);
        toast.error(`Email Error: ${err?.text || err?.message || 'Check console for details'}`, { duration: 5000 });
        toast(`Your code: ${newCode}`, {
          duration: 30000,
          icon: '🔑',
          style: {
            background: '#1a1f36',
            color: '#a855f7',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '2px',
          },
        });
      }
    } else {
      // EmailJS not configured — show code via toast
      toast.success(
        `Verification code sent to ${email}`,
        { duration: 4000, icon: '📧' }
      );
      toast(`Your code: ${newCode}`, {
        duration: 30000,
        icon: '🔑',
        style: {
          background: '#1a1f36',
          color: '#a855f7',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          fontWeight: 600,
          fontSize: '14px',
          letterSpacing: '2px',
        },
      });
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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}hero-bg.png)` }}
      />
      <div className="absolute inset-0 bg-dark-950/85" />
      <div className="absolute inset-0 bg-auth" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Particles */}
      <ParticleField />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Card */}
        <div className="bg-dark-800/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-glass">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="TradeSphere"
              className="w-14 h-14 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            />
            <h1 className="text-2xl font-bold text-gradient mb-1">
              TradeSphere AI
            </h1>
            <p className="text-dark-400 text-sm">
              {step === 'details' ? 'Create your trading account' : 'Verify your email'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs text-center"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Step 1: Account Details ──────────────── */}
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
                    autoComplete="name"
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    autoComplete="email"
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    autoComplete="new-password"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={sendingCode}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Verification Code
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: Verification Code ───────────── */}
            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleVerifyAndSignup} className="space-y-5">
                  {/* Email display */}
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

                  {/* Instruction */}
                  <div className="text-center">
                    <ShieldCheck className="w-10 h-10 text-accent-purple mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-dark-400">
                      We sent a 6-digit verification code to
                      <br />
                      <span className="text-accent-purple font-medium">{email}</span>
                    </p>
                  </div>

                  {/* Code input */}
                  <CodeInput
                    length={6}
                    value={code}
                    onChange={(val) => { setCode(val); setErrors({}); }}
                    error={errors.code}
                  />

                  {/* Resend */}
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

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isLoading}
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    Verify & Create Account
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign in link */}
          <p className="mt-6 text-center text-xs text-dark-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-dark-500">
          © 2026 TradeSphere AI · Paper Trading Simulator
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
