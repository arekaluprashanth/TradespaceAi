import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalTooltip() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let currentTarget: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find closest button or link
      const interactiveEl = target.closest('button, a, [title]') as HTMLElement;
      
      if (interactiveEl) {
        // Extract info
        let info = interactiveEl.getAttribute('title') || interactiveEl.getAttribute('aria-label');
        if (!info && interactiveEl.tagName.toLowerCase() === 'button') {
          info = interactiveEl.innerText.trim() || 'Interactive Button';
        }
        if (!info && interactiveEl.tagName.toLowerCase() === 'a') {
          info = interactiveEl.innerText.trim() || 'Link';
        }

        if (info && info.length > 0) {
          currentTarget = interactiveEl;
          
          // Subtle highlight matching the dashboard sidebars
          interactiveEl.style.boxShadow = 'inset 0 0 0 1px rgba(0,240,255,0.3), 0 4px 20px rgba(0,240,255,0.1)';
          interactiveEl.style.transform = 'translateY(-1px)';
          interactiveEl.style.transition = 'all 0.2s ease-out';
          interactiveEl.style.zIndex = '50';
          
          // Show tooltip
          const rect = interactiveEl.getBoundingClientRect();
          setTooltip({
            text: info,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10,
          });

          // Remove native title to prevent default browser tooltip overlapping
          if (interactiveEl.hasAttribute('title')) {
            interactiveEl.dataset.title = interactiveEl.getAttribute('title') || '';
            interactiveEl.removeAttribute('title');
          }
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (currentTarget) {
        // Remove highlight
        currentTarget.style.transform = '';
        currentTarget.style.boxShadow = '';
        currentTarget.style.zIndex = '';
        
        // Restore native title
        if (currentTarget.dataset.title) {
          currentTarget.setAttribute('title', currentTarget.dataset.title);
        }
        
        currentTarget = null;
        setTooltip(null);
      }
    };

    // Use capturing phase to ensure we catch events before they get stopped
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      if (currentTarget) {
        currentTarget.style.transform = '';
        currentTarget.style.boxShadow = '';
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            zIndex: 99999,
          }}
          className="pointer-events-none px-3 py-1.5 bg-dark-900 text-white text-xs font-semibold rounded-lg border border-accent-cyan shadow-glow-cyan whitespace-nowrap"
        >
          {tooltip.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
