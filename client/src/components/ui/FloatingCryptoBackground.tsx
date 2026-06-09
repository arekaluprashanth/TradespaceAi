import React from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Activity, TrendingUp, DollarSign, Hexagon, BarChart2, Globe, Cpu } from 'lucide-react';

export default function FloatingCryptoBackground() {
  // Removed expensive React state mouse listener to ensure smooth 165Hz performance
  
  const icons = [
    { Icon: Bitcoin, color: 'text-orange-500', size: 64, top: '15%', left: '10%', delay: 0, duration: 8 },
    { Icon: Hexagon, color: 'text-accent-purple', size: 80, top: '65%', left: '15%', delay: 1, duration: 10 },
    { Icon: Activity, color: 'text-accent-cyan', size: 56, top: '25%', left: '85%', delay: 2, duration: 7 },
    { Icon: TrendingUp, color: 'text-accent-green', size: 72, top: '75%', left: '80%', delay: 1.5, duration: 9 },
    { Icon: DollarSign, color: 'text-emerald-500', size: 48, top: '40%', left: '45%', delay: 3, duration: 6 },
    { Icon: BarChart2, color: 'text-blue-500', size: 60, top: '20%', left: '50%', delay: 0.5, duration: 8.5 },
    { Icon: Globe, color: 'text-indigo-500', size: 90, top: '80%', left: '40%', delay: 2.5, duration: 11 },
    { Icon: Cpu, color: 'text-rose-500', size: 50, top: '50%', left: '90%', delay: 1.2, duration: 7.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background glowing abstract orbs - optimized without parallax */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.15, 0.2, 0.15]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-accent-cyan/30 rounded-full blur-[100px] mix-blend-screen will-change-transform"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-accent-purple/30 rounded-full blur-[120px] mix-blend-screen will-change-transform"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px] mix-blend-screen will-change-transform"
      />

      {/* Floating Crypto Icons - optimized without heavy filters */}
      {icons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 100 }}
          animate={{ 
            opacity: 0.15, 
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            opacity: { duration: 2, delay: item.delay },
            y: { duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
            rotate: { duration: item.duration * 1.5, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
          }}
          className={`absolute ${item.color} will-change-transform`}
          style={{ top: item.top, left: item.left }}
        >
          <item.Icon size={item.size} strokeWidth={1.5} />
        </motion.div>
      ))}

      {/* Grid overlay to give it a techy feel */}
      <div className="absolute inset-0 bg-grid opacity-10 mix-blend-overlay" />
    </div>
  );
}
