/**
 * Force Mobile Scroll - Emergency Fix
 * This utility forcefully enables scroll on mobile devices
 */

export function forceMobileScroll() {
  if (typeof window === 'undefined') return;

  // Only run on mobile devices
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;

  console.log('🔧 Force Mobile Scroll: Initializing...');

  // Force scroll on html and body
  const html = document.documentElement;
  const body = document.body;

  // Remove any overflow restrictions
  html.style.overflowY = 'auto';
  html.style.overflowX = 'hidden';
  html.style.webkitOverflowScrolling = 'touch';
  html.style.height = 'auto';
  html.style.minHeight = '100vh';

  body.style.overflowY = 'auto';
  body.style.overflowX = 'hidden';
  body.style.webkitOverflowScrolling = 'touch';
  body.style.height = 'auto';
  body.style.minHeight = '100vh';
  body.style.position = 'static';

  // Remove data-scroll-locked attribute if present (from Radix UI)
  body.removeAttribute('data-scroll-locked');

  // Monitor for changes and force scroll
  const observer = new MutationObserver(() => {
    if (body.style.overflow === 'hidden' || body.style.overflowY === 'hidden') {
      console.log('⚠️ Detected overflow:hidden, forcing scroll...');
      body.style.overflowY = 'auto';
      body.style.overflow = '';
    }

    if (body.hasAttribute('data-scroll-locked')) {
      console.log('⚠️ Detected scroll lock, removing...');
      body.removeAttribute('data-scroll-locked');
      body.style.overflowY = 'auto';
      body.style.paddingRight = '0';
    }
  });

  observer.observe(body, {
    attributes: true,
    attributeFilter: ['style', 'data-scroll-locked']
  });

  console.log('✅ Force Mobile Scroll: Active');

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}

// Auto-run on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceMobileScroll);
  } else {
    forceMobileScroll();
  }
}
