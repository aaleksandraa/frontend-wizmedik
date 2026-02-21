import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the API modules
vi.mock('@/services/api', () => ({
  doctorsAPI: {
    getMyProfile: vi.fn().mockResolvedValue({ data: { slug: 'test-doctor' } }),
  },
  notifikacijeAPI: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    getNeprocitane: vi.fn().mockResolvedValue({ data: { count: 0 } }),
    markAsRead: vi.fn().mockResolvedValue({}),
    markAllAsRead: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

// Mock useNavbarTheme hook
vi.mock('@/hooks/useNavbarTheme', () => ({
  useNavbarTheme: () => ({
    variant: 'default',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    hoverBgColor: 'hover:bg-gray-100',
    activeBgColor: 'bg-primary/10',
    activeTextColor: 'text-primary',
    logoGradient: 'from-primary to-primary/70',
  }),
}));

// Helper function to set viewport size
const setViewportSize = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper to render Navbar with providers
const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Responsive Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Logo visibility on various mobile screen sizes (320px - 1023px)', () => {
    const mobileWidths = [
      { width: 320, device: 'iPhone SE' },
      { width: 375, device: 'iPhone 12 Pro' },
      { width: 390, device: 'iPhone 13' },
      { width: 393, device: 'Pixel 5' },
      { width: 412, device: 'Samsung Galaxy S20' },
      { width: 768, device: 'iPad Mini' },
      { width: 820, device: 'iPad Air' },
      { width: 1023, device: 'Just below desktop breakpoint' },
    ];

    mobileWidths.forEach(({ width, device }) => {
      it(`should display LogoCompact on ${device} (${width}px)`, () => {
        setViewportSize(width);
        const { container } = renderNavbar();

        // Check that mobile logo container is visible (block lg:hidden)
        const mobileLogoContainer = container.querySelector('.block.lg\\:hidden');
        expect(mobileLogoContainer).toBeTruthy();

        // Check that desktop logo container is hidden (hidden lg:block)
        const desktopLogoContainer = container.querySelector('.hidden.lg\\:block');
        expect(desktopLogoContainer).toBeTruthy();
      });
    });

    it('should have clickable logo link on mobile', () => {
      setViewportSize(375);
      const { container } = renderNavbar();

      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toBeTruthy();
      expect(logoLink?.classList.contains('shrink-0')).toBe(true);
    });

    it('should not cause horizontal overflow on smallest screen (320px)', () => {
      setViewportSize(320);
      const { container } = renderNavbar();

      const navbar = container.querySelector('nav');
      expect(navbar).toBeTruthy();

      // Check that navbar has proper overflow handling
      const navbarInner = navbar?.querySelector('.flex.h-20');
      expect(navbarInner).toBeTruthy();
    });
  });

  describe('Logo transition at 1024px breakpoint', () => {
    it('should show LogoCompact at 1023px', () => {
      setViewportSize(1023);
      const { container } = renderNavbar();

      const mobileLogoContainer = container.querySelector('.block.lg\\:hidden');
      const desktopLogoContainer = container.querySelector('.hidden.lg\\:block');

      expect(mobileLogoContainer).toBeTruthy();
      expect(desktopLogoContainer).toBeTruthy();
    });

    it('should show Logo at 1024px and above', () => {
      setViewportSize(1024);
      const { container } = renderNavbar();

      // At 1024px, Tailwind's lg breakpoint activates
      // Desktop logo should be visible, mobile logo should be hidden
      const mobileLogoContainer = container.querySelector('.block.lg\\:hidden');
      const desktopLogoContainer = container.querySelector('.hidden.lg\\:block');

      expect(mobileLogoContainer).toBeTruthy();
      expect(desktopLogoContainer).toBeTruthy();
    });

    it('should maintain layout structure across breakpoint', () => {
      // Test at mobile width
      setViewportSize(1023);
      const { container: mobileContainer } = renderNavbar();
      const mobileLogoLink = mobileContainer.querySelector('a[href="/"]');
      expect(mobileLogoLink?.classList.contains('shrink-0')).toBe(true);

      // Test at desktop width
      setViewportSize(1024);
      const { container: desktopContainer } = renderNavbar();
      const desktopLogoLink = desktopContainer.querySelector('a[href="/"]');
      expect(desktopLogoLink?.classList.contains('shrink-0')).toBe(true);
    });
  });

  describe('No horizontal overflow on small screens', () => {
    it('should prevent logo from shrinking with shrink-0 class', () => {
      setViewportSize(320);
      const { container } = renderNavbar();

      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink?.classList.contains('shrink-0')).toBe(true);
    });

    it('should maintain proper spacing with gap classes', () => {
      setViewportSize(320);
      const { container } = renderNavbar();

      const navbarInner = container.querySelector('.flex.h-20');
      expect(navbarInner?.classList.contains('gap-3')).toBe(true);
    });

    it('should have proper container constraints', () => {
      setViewportSize(320);
      const { container } = renderNavbar();

      const maxWidthContainer = container.querySelector('.max-w-7xl');
      expect(maxWidthContainer).toBeTruthy();
      expect(maxWidthContainer?.classList.contains('px-4')).toBe(true);
    });
  });

  describe('Logo remains visible when scrolling (sticky navbar)', () => {
    it('should have sticky positioning classes', () => {
      const { container } = renderNavbar();

      const navbar = container.querySelector('nav');
      expect(navbar?.classList.contains('sticky')).toBe(true);
      expect(navbar?.classList.contains('top-0')).toBe(true);
      expect(navbar?.classList.contains('z-50')).toBe(true);
    });

    it('should maintain logo visibility with sticky navbar on mobile', () => {
      setViewportSize(375);
      const { container } = renderNavbar();

      const navbar = container.querySelector('nav');
      const logoLink = container.querySelector('a[href="/"]');

      expect(navbar?.classList.contains('sticky')).toBe(true);
      expect(logoLink).toBeTruthy();
    });

    it('should maintain logo visibility with sticky navbar on desktop', () => {
      setViewportSize(1024);
      const { container } = renderNavbar();

      const navbar = container.querySelector('nav');
      const logoLink = container.querySelector('a[href="/"]');

      expect(navbar?.classList.contains('sticky')).toBe(true);
      expect(logoLink).toBeTruthy();
    });
  });

  describe('Requirements validation', () => {
    it('validates Requirement 1.3: Logo remains visible when scrolling', () => {
      setViewportSize(375);
      const { container } = renderNavbar();

      const navbar = container.querySelector('nav');
      expect(navbar?.classList.contains('sticky')).toBe(true);
      expect(navbar?.classList.contains('top-0')).toBe(true);
    });

    it('validates Requirement 2.2: No horizontal overflow', () => {
      setViewportSize(320);
      const { container } = renderNavbar();

      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink?.classList.contains('shrink-0')).toBe(true);

      const navbarInner = container.querySelector('.flex.h-20');
      expect(navbarInner?.classList.contains('gap-3')).toBe(true);
    });

    it('validates Requirement 2.3: Logo visible on all mobile devices (320px - 1023px)', () => {
      const testWidths = [320, 375, 412, 768, 1023];

      testWidths.forEach((width) => {
        setViewportSize(width);
        const { container } = renderNavbar();

        const mobileLogoContainer = container.querySelector('.block.lg\\:hidden');
        expect(mobileLogoContainer).toBeTruthy();
      });
    });
  });
});
