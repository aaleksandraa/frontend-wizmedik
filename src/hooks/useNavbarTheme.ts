import { useMemo } from 'react';
import { useHomepageData } from './useHomepageData';

export interface NavbarTheme {
  variant: 'default' | 'colored' | 'transparent' | 'gradient';
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  activeBgColor: string;
  activeTextColor: string;
  borderColor: string;
  logoGradient: string;
  buttonBg: string;
  buttonHoverBg: string;
}

const templateThemes: Record<string, NavbarTheme> = {
  'custom2-cyan': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-cyan-100/50',
    activeBgColor: 'bg-cyan-100',
    activeTextColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    logoGradient: 'from-cyan-600 to-teal-600',
    buttonBg: 'bg-cyan-600 text-white',
    buttonHoverBg: 'hover:bg-cyan-700',
  },
  'custom2-yellow': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-amber-100/50',
    activeBgColor: 'bg-amber-100',
    activeTextColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    logoGradient: 'from-amber-500 to-orange-500',
    buttonBg: 'bg-amber-500 text-white',
    buttonHoverBg: 'hover:bg-amber-600',
  },
  'zocdoc': {
    variant: 'colored',
    bgColor: 'bg-[#f0f7f4]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-[#e0f0eb]',
    activeBgColor: 'bg-[#d0e8e0]',
    activeTextColor: 'text-[#00856f]',
    borderColor: 'border-[#d0e8e0]',
    logoGradient: 'from-[#00856f] to-[#00a085]',
    buttonBg: 'bg-[#00856f] text-white',
    buttonHoverBg: 'hover:bg-[#00a085]',
  },
  'warm': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-[#FFFBF5] via-[#FFF8E7] to-[#FEF3E2]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-[#FFF0D0]',
    activeBgColor: 'bg-[#FFE8B8]',
    activeTextColor: 'text-[#C4941A]',
    borderColor: 'border-[#E8DFD0]',
    logoGradient: 'from-[#C4941A] to-[#D4A429]',
    buttonBg: 'bg-[#C4941A] text-white',
    buttonHoverBg: 'hover:bg-[#D4A429]',
  },
  'ocean': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-[#F0F7FF] via-[#E3F2FD] to-[#E8F4FD]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-blue-100/50',
    activeBgColor: 'bg-blue-100',
    activeTextColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    logoGradient: 'from-blue-600 to-blue-500',
    buttonBg: 'bg-blue-600 text-white',
    buttonHoverBg: 'hover:bg-blue-700',
  },
  'lime': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-[#FAFFF5] via-[#F0FFF0] to-[#E8F5E9]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-lime-100/50',
    activeBgColor: 'bg-lime-100',
    activeTextColor: 'text-[#6B8E23]',
    borderColor: 'border-lime-200',
    logoGradient: 'from-[#6B8E23] to-[#7BA428]',
    buttonBg: 'bg-[#6B8E23] text-white',
    buttonHoverBg: 'hover:bg-[#7BA428]',
  },
  'teal': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-[#F0FDFA] via-[#E0F7FA] to-[#E0F2F1]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-teal-100/50',
    activeBgColor: 'bg-teal-100',
    activeTextColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    logoGradient: 'from-teal-600 to-teal-500',
    buttonBg: 'bg-teal-600 text-white',
    buttonHoverBg: 'hover:bg-teal-700',
  },
  'rose': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-[#FFF5F5] via-[#FFF0F0] to-[#FCE4EC]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-rose-100/50',
    activeBgColor: 'bg-rose-100',
    activeTextColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    logoGradient: 'from-rose-500 to-pink-500',
    buttonBg: 'bg-rose-500 text-white',
    buttonHoverBg: 'hover:bg-rose-600',
  },
  'sunset': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-[#FFF8F0] via-[#FFF3E0] to-[#FFE0B2]',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-orange-100/50',
    activeBgColor: 'bg-orange-100',
    activeTextColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    logoGradient: 'from-orange-500 to-red-500',
    buttonBg: 'bg-orange-500 text-white',
    buttonHoverBg: 'hover:bg-orange-600',
  },
  'bold': {
    variant: 'gradient',
    bgColor: 'bg-gradient-to-r from-violet-100 via-purple-100 to-cyan-100',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-violet-200/50',
    activeBgColor: 'bg-violet-200',
    activeTextColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    logoGradient: 'from-violet-600 to-cyan-600',
    buttonBg: 'bg-violet-600 text-white',
    buttonHoverBg: 'hover:bg-violet-700',
  },
  'modern': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-emerald-100/50',
    activeBgColor: 'bg-emerald-100',
    activeTextColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    logoGradient: 'from-emerald-600 to-teal-600',
    buttonBg: 'bg-emerald-600 text-white',
    buttonHoverBg: 'hover:bg-emerald-700',
  },
  'soft': {
    variant: 'colored',
    bgColor: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
    textColor: 'text-gray-800',
    hoverBgColor: 'hover:bg-purple-100/50',
    activeBgColor: 'bg-purple-100',
    activeTextColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    logoGradient: 'from-purple-500 to-pink-500',
    buttonBg: 'bg-purple-500 text-white',
    buttonHoverBg: 'hover:bg-purple-600',
  },
};

const defaultTheme: NavbarTheme = {
  variant: 'default',
  bgColor: 'bg-white',
  textColor: 'text-gray-700',
  hoverBgColor: 'hover:bg-gray-100',
  activeBgColor: 'bg-primary/10',
  activeTextColor: 'text-primary',
  borderColor: 'border-gray-200',
  logoGradient: 'from-primary to-primary/70',
  buttonBg: 'bg-primary',
  buttonHoverBg: 'hover:bg-primary/90',
};

export function useNavbarTheme() {
  const { data } = useHomepageData();
  
  const theme = useMemo(() => {
    const template = data?.settings?.homepage_template || 'classic';
    const navbarStyle = data?.settings?.navbar_style || 'auto';
    
    // Ako je navbar_style 'default', uvijek koristi default temu
    if (navbarStyle === 'default') {
      return defaultTheme;
    }
    
    // Ako je 'colored', uvijek koristi obojenu temu template-a
    if (navbarStyle === 'colored' && templateThemes[template]) {
      return templateThemes[template];
    }
    
    // Ako je 'auto' (default), koristi temu template-a ako postoji
    return templateThemes[template] || defaultTheme;
  }, [data?.settings?.homepage_template, data?.settings?.navbar_style]);

  return theme;
}
