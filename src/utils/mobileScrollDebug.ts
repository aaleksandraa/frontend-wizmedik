/**
 * Mobile Scroll Debug Utility
 * Logs everything that happens with scroll on mobile devices
 */

export function initMobileScrollDebug() {
  if (typeof window === 'undefined') return;

  const isMobile = window.innerWidth <= 768;
  if (!isMobile) {
    console.log('📱 Not mobile device, skipping debug');
    return;
  }

  console.log('🔍 Mobile Scroll Debug: Starting...');
  console.log('📱 Device Info:', {
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  });

  // Check initial state
  const html = document.documentElement;
  const body = document.body;

  console.log('📊 Initial State:', {
    html: {
      overflow: getComputedStyle(html).overflow,
      overflowY: getComputedStyle(html).overflowY,
      overflowX: getComputedStyle(html).overflowX,
      height: getComputedStyle(html).height,
      position: getComputedStyle(html).position,
    },
    body: {
      overflow: getComputedStyle(body).overflow,
      overflowY: getComputedStyle(body).overflowY,
      overflowX: getComputedStyle(body).overflowX,
      height: getComputedStyle(body).height,
      position: getComputedStyle(body).position,
      scrollLocked: body.hasAttribute('data-scroll-locked'),
    },
  });

  // Monitor scroll events
  let scrollCount = 0;
  window.addEventListener('scroll', () => {
    scrollCount++;
    if (scrollCount <= 5) {
      console.log(`📜 Scroll Event #${scrollCount}:`, {
        scrollY: window.scrollY,
        scrollX: window.scrollX,
      });
    }
  }, { passive: true });

  // Monitor touch events
  let touchCount = 0;
  window.addEventListener('touchstart', () => {
    touchCount++;
    if (touchCount <= 5) {
      console.log(`👆 Touch Start #${touchCount}`);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (touchCount <= 5) {
      console.log(`👆 Touch Move:`, {
        touches: e.touches.length,
        defaultPrevented: e.defaultPrevented,
      });
    }
  }, { passive: true });

  // Monitor body attribute changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        if (mutation.attributeName === 'style') {
          console.log('⚠️ Body style changed:', {
            overflow: body.style.overflow,
            overflowY: body.style.overflowY,
            overflowX: body.style.overflowX,
          });
        }
        if (mutation.attributeName === 'data-scroll-locked') {
          console.log('⚠️ Scroll lock changed:', body.hasAttribute('data-scroll-locked'));
        }
      }
    });
  });

  observer.observe(body, {
    attributes: true,
    attributeFilter: ['style', 'data-scroll-locked', 'class'],
  });

  // Check if scroll is working after 2 seconds
  setTimeout(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const hasHorizontalOverflow = scrollWidth > clientWidth;
    
    console.log('🔍 After 2s - Current State:', {
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: scrollWidth,
      clientWidth: clientWidth,
      hasHorizontalOverflow: hasHorizontalOverflow,
      canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      bodyOverflow: getComputedStyle(body).overflow,
      bodyOverflowY: getComputedStyle(body).overflowY,
      bodyOverflowX: getComputedStyle(body).overflowX,
      htmlOverflow: getComputedStyle(html).overflow,
      htmlOverflowY: getComputedStyle(html).overflowY,
      htmlOverflowX: getComputedStyle(html).overflowX,
    });

    if (scrollCount === 0 && touchCount > 0) {
      console.error('❌ PROBLEM: Touch events detected but NO scroll events!');
      console.error('This means scroll is blocked by something.');
    }
    
    if (hasHorizontalOverflow) {
      console.warn('⚠️ HORIZONTAL OVERFLOW DETECTED!');
      console.warn(`Page width (${scrollWidth}px) is wider than viewport (${clientWidth}px)`);
      console.warn('Finding elements causing overflow...');
      
      // Find elements causing horizontal overflow
      const allElements = document.querySelectorAll('*');
      const overflowingElements: HTMLElement[] = [];
      
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth || rect.width > clientWidth) {
            overflowingElements.push(el);
          }
        }
      });
      
      console.warn(`Found ${overflowingElements.length} elements causing overflow:`);
      overflowingElements.slice(0, 10).forEach((el) => {
        const rect = el.getBoundingClientRect();
        console.warn('  -', el.tagName, el.className, {
          width: rect.width,
          right: rect.right,
          viewportWidth: clientWidth,
          overflow: rect.right - clientWidth,
        });
      });
    }
  }, 2000);

  console.log('✅ Mobile Scroll Debug: Active');
}

// Auto-run on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileScrollDebug);
  } else {
    initMobileScrollDebug();
  }
}
