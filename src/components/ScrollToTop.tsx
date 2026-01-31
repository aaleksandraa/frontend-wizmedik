import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatski scrolluje stranicu na vrh kada se promijeni ruta.
 * Ovo rješava problem kada korisnik klikne na link i stranica ostane
 * na istoj scroll poziciji umjesto da se vrati na vrh.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll na vrh stranice kada se promijeni pathname
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' za trenutni scroll, 'smooth' za smooth scroll
    });
  }, [pathname]);

  return null;
}
