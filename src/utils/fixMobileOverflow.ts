/**
 * Professional Mobile Overflow Fix
 * Detects and fixes all elements causing horizontal overflow on mobile devices
 */

export function fixMobileOverflow() {
  if (typeof window === 'undefined') return;

  // Only run on mobile devices
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;

  // Function to check if element causes overflow
  const causesOverflow = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // Check if element extends beyond viewport
    return rect.right > viewportWidth || rect.width > viewportWidth;
  };

  // Function to fix element
  const fixElement = (element: HTMLElement) => {
    // Skip if already fixed
    if (element.dataset.overflowFixed === 'true') return;

    const computedStyle = window.getComputedStyle(element);
    
    // Fix width
    if (causesOverflow(element)) {
      element.style.maxWidth = '100vw';
      element.style.width = '100%';
      element.style.overflowX = 'hidden';
      
      // Fix margins that might cause overflow
      const marginLeft = parseInt(computedStyle.marginLeft) || 0;
      const marginRight = parseInt(computedStyle.marginRight) || 0;
      if (marginLeft < 0 || marginRight < 0) {
        element.style.marginLeft = '0';
        element.style.marginRight = '0';
      }
      
      // Fix padding if it causes overflow
      const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
      const paddingRight = parseInt(computedStyle.paddingRight) || 0;
      const totalPadding = paddingLeft + paddingRight;
      
      if (totalPadding > window.innerWidth * 0.2) {
        element.style.paddingLeft = '1rem';
        element.style.paddingRight = '1rem';
      }
      
      // Mark as fixed
      element.dataset.overflowFixed = 'true';
      
      console.log('Fixed overflow element:', element.tagName, element.className);
    }
  };

  // Fix all elements
  const fixAllElements = () => {
    // Get all elements
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        fixElement(element);
      }
    });
  };

  // Run immediately
  fixAllElements();

  // Run after DOM changes
  const observer = new MutationObserver(() => {
    fixAllElements();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  // Run on resize
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(fixAllElements, 100);
  });

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}

// DISABLED: This utility was causing scroll issues on mobile
// The aggressive DOM manipulation was preventing proper scroll behavior
// Mobile overflow is now handled via CSS in index.css

// Auto-run on load - DISABLED
// if (typeof window !== 'undefined') {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', fixMobileOverflow);
//   } else {
//     fixMobileOverflow();
//   }
// }
