import React, { useEffect } from 'react';

export default function GlobalTooltip() {
  useEffect(() => {
    let currentTarget: HTMLElement | null = null;
    let originalTransform = '';

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find closest button or link
      const interactiveEl = target.closest('button, a, .group, [role="button"]') as HTMLElement;
      
      if (interactiveEl && !interactiveEl.closest('.no-global-hover')) {
        currentTarget = interactiveEl;
        originalTransform = interactiveEl.style.transform || '';
        
        // Add smooth pop-up scale effect globally
        interactiveEl.style.transform = originalTransform ? `${originalTransform} scale(1.05)` : 'scale(1.05)';
        interactiveEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s ease-out';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (currentTarget) {
        currentTarget.style.transform = originalTransform;
        currentTarget = null;
      }
    };

    // Use capturing phase
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      if (currentTarget) {
        currentTarget.style.transform = originalTransform;
      }
    };
  }, []);

  return null;
}
