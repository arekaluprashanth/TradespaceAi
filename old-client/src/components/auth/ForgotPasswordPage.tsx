import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ArrowLeft, Send, CheckCircle, Lock } from 'lucide-react';
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

// ── Forgot Password Page ────────────────────────────────

type Step = 'email' | 'verify';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email address';
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
            to_name: 'Trader', // fallback name
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
    if (!validateEmail()) return;
    setSendingCode(true);
    await generateAndSendCode();
    setStep('verify');
    setSendingCode(false);
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (code.length < 6) errs.code = 'Please enter the 6-digit code';
    else if (code !== generatedCode) errs.code = 'Invalid code. Please try again.';

    if (!newPassword) errs.newPassword = 'Password is required';
    else if (newPassword.length < 6) errs.newPassword = 'Minimum 6 characters';
    
    if (!confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    
    await resetPassword(email, newPassword);
    
    toast.success('Password reset successfully! You can now log in.', { duration: 4000 });
    navigate('/login');
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await generateAndSendCode();
  };

  const handleBack = () => {
    setStep('email');
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
              Reset Password
            </h1>
            <p className="text-dark-400 text-sm text-center">
              {step === 'email' 
                ? "Enter your email to receive a code" 
                : "Verify your identity"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Email Input ──────────────── */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    autoComplete="email"
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

            {/* ── Step 2: Verification & New Password ───────────── */}
            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleVerifyAndReset} className="space-y-5">
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

                  {/* Code input */}
                  <div className="pt-2">
                    <CodeInput
                      length={6}
                      value={code}
                      onChange={(val) => { setCode(val); setErrors((prev) => ({ ...prev, code: '' })); }}
                      error={errors.code}
                    />
                  </div>
                  
                  {/* Resend */}
                  <div className="text-center pb-2">
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

                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock className="w-4 h-4" />}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={errors.newPassword}
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock className="w-4 h-4" />}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                    />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isLoading}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    Reset Password
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to sign in link */}
          <p className="mt-6 text-center text-xs text-dark-400">
            Remember your password?{' '}
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

export default ForgotPasswordPage;
