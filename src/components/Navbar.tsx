import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doctorsAPI, notifikacijeAPI } from '@/services/api';
import { useNavbarTheme } from '@/hooks/useNavbarTheme';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LogOut,
  LayoutDashboard,
  Stethoscope,
  Building2,
  Shield,
  Menu,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Home,
  Eye,
  Bell,
  Check,
  Trash2,
  Users,
  BookOpen,
  FlaskConical,
  FileText,
  Droplet,
  Heart,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

const navLinks = [
  { href: '/', label: 'Početna', icon: Home },
  { href: '/doktori', label: 'Doktori', icon: Users },
  { href: '/klinike', label: 'Klinike', icon: Building2 },
  { href: '/specijalnosti', label: 'Specijalnosti', icon: Stethoscope },
  // Gradovi izbačeni iz glavnog menija
  { href: '/laboratorije', label: 'Laboratorije', icon: FlaskConical },
  { href: '/banje', label: 'Banje', icon: Droplet },
  { href: '/domovi-njega', label: 'Domovi', icon: Heart },
  { href: '/pitanja', label: 'Pitanja', icon: HelpCircle },
  { href: '/blog', label: 'Savjeti', icon: BookOpen },
];

const infoLinks = [
  { href: '/about', label: 'O wizMedik' },
  { href: '/gradovi', label: 'Gradovi' }, // prebačeno u Informacije
  { href: '/register/doctor', label: 'Za Doktore' },
  { href: '/register/clinic', label: 'Za Klinike' },
  { href: '/register/laboratory', label: 'Za Laboratorije' },
  { href: '/register/spa', label: 'Za Banje' },
  { href: '/register/care-home', label: 'Za Domove' },
  { href: '/contact', label: 'Kontakt' },
  { href: '/faq', label: 'FAQ' },
];

interface Notifikacija {
  id: number;
  tip: string;
  naslov: string;
  poruka: string;
  procitano: boolean;
  created_at: string;
  data?: {
    termin_id?: number;
    datum?: string;
    gostovanje_id?: number;
    klinika_id?: number;
    doktor_id?: number;
    zahtjev_id?: number;
    pitanje_id?: number;
    pitanje_slug?: string;
    specijalnost_id?: number;
  };
}

function DesktopNavLink({
  href,
  label,
  active,
  theme,
}: {
  href: string;
  label: string;
  active: boolean;
  theme: ReturnType<typeof useNavbarTheme>;
}) {
  const isColored = theme.variant === 'colored' || theme.variant === 'gradient';
  
  return (
    <Link
      to={href}
      className={[
        'h-12 inline-flex items-center px-4 rounded-lg text-sm font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2',
        isColored 
          ? active 
            ? `${theme.activeBgColor} ${theme.activeTextColor} shadow-sm` 
            : `${theme.textColor} ${theme.hoverBgColor} hover:shadow-sm`
          : active 
            ? 'bg-primary/10 text-primary shadow-sm' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm',
        isColored 
          ? 'focus-visible:ring-white/30' 
          : 'focus-visible:ring-primary/30',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useNavbarTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctorSlug, setDoctorSlug] = useState<string | null>(null);
  const [notifikacije, setNotifikacije] = useState<Notifikacija[]>([]);
  const [neprocitaneCount, setNeprocitaneCount] = useState(0);

  const isColored = theme.variant === 'colored' || theme.variant === 'gradient';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const dashboardLink = useMemo(() => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/doctor-dashboard';
    if (user.role === 'clinic') return '/clinic-dashboard';
    if (user.role === 'laboratory') return '/laboratory-dashboard';
    if (user.role === 'spa_manager') return '/spa-dashboard';
    return '/dashboard';
  }, [user]);

  const dashboardLabel = useMemo(() => {
    if (!user) return 'Dashboard';
    if (user.role === 'admin') return 'Admin Panel';
    if (user.role === 'doctor') return 'Doktor Dashboard';
    if (user.role === 'clinic') return 'Klinika Dashboard';
    if (user.role === 'laboratory') return 'Laboratorija Dashboard';
    if (user.role === 'spa_manager') return 'Banja Dashboard';
    return 'Moj Dashboard';
  }, [user]);

  const dashboardIcon = useMemo(() => {
    if (!user) return <LayoutDashboard className="w-4 h-4" />;
    if (user.role === 'admin') return <Shield className="w-4 h-4" />;
    if (user.role === 'doctor') return <Stethoscope className="w-4 h-4" />;
    if (user.role === 'clinic') return <Building2 className="w-4 h-4" />;
    if (user.role === 'laboratory') return <FlaskConical className="w-4 h-4" />;
    if (user.role === 'spa_manager') return <Droplet className="w-4 h-4" />;
    return <LayoutDashboard className="w-4 h-4" />;
  }, [user]);

  // Doctor slug
  useEffect(() => {
    let mounted = true;

    if (user?.role === 'doctor') {
      doctorsAPI
        .getMyProfile()
        .then((res) => {
          if (!mounted) return;
          if (res.data?.slug) setDoctorSlug(res.data.slug);
        })
        .catch(() => {});
    } else {
      setDoctorSlug(null);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  // Notifications (polling)
  useEffect(() => {
    if (!user) {
      setNotifikacije([]);
      setNeprocitaneCount(0);
      return;
    }

    let mounted = true;

    const fetchNotifikacije = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          notifikacijeAPI.getAll(),
          notifikacijeAPI.getNeprocitane(),
        ]);

        if (!mounted) return;

        setNotifikacije(notifRes.data || []);
        setNeprocitaneCount(countRes.data?.count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifikacije();
    const interval = setInterval(fetchNotifikacije, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notifikacijeAPI.markAsRead(id);
      setNotifikacije((prev) => prev.map((n) => (n.id === id ? { ...n, procitano: true } : n)));
      setNeprocitaneCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notifikacijeAPI.markAllAsRead();
      setNotifikacije((prev) => prev.map((n) => ({ ...n, procitano: true })));
      setNeprocitaneCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notifikacijeAPI.delete(id);
      const deleted = notifikacije.find((n) => n.id === id);
      setNotifikacije((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.procitano) {
        setNeprocitaneCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notif: Notifikacija) => {
    if (!notif.procitano) {
      await handleMarkAsRead(notif.id);
    }

    if (notif.tip === 'termin_zakazan' && notif.data?.datum) {
      navigate(`${dashboardLink}?tab=kalendar&date=${notif.data.datum}`);
    } else if (notif.tip === 'gostovanje_poziv') {
      navigate(`${dashboardLink}?tab=gostovanja`);
    } else if (notif.tip === 'doktor_zahtjev' || notif.tip === 'klinika_poziv') {
      navigate(dashboardLink);
    } else if (
      (notif.tip === 'novo_pitanje' || notif.tip === 'odgovor_na_pitanje') &&
      notif.data?.pitanje_slug
    ) {
      navigate(`/pitanja/${notif.data.pitanje_slug}`);
    } else {
      navigate(dashboardLink);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setNotifikacije([]);
    setNeprocitaneCount(0);
    setDoctorSlug(null);
    navigate('/');
  };

  return (
    <nav className={`sticky top-0 z-50 border-b ${theme.borderColor} ${theme.bgColor} shadow-sm`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-20 items-center justify-between gap-3">{/* Increased from h-14 to h-20 */}
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <Logo className="h-10" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5 min-w-0">
            {navLinks.slice(1).map((link) => (
              <DesktopNavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActive(link.href)}
                theme={theme}
              />
            ))}

            {/* Info dropdown (desktop) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={[
                    'h-12 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                    isColored 
                      ? `${theme.textColor} ${theme.hoverBgColor} hover:shadow-sm hover:!text-gray-800 data-[state=open]:${theme.activeBgColor} data-[state=open]:${theme.activeTextColor} data-[state=open]:shadow-sm`
                      : 'text-gray-700 hover:bg-gray-100 hover:!text-gray-900 hover:shadow-sm data-[state=open]:bg-primary/10 data-[state=open]:!text-primary data-[state=open]:shadow-sm'
                  ].join(' ')}
                >
                  Informacije
                  <ChevronDown className="ml-1.5 h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 rounded-xl shadow-xl border-gray-200 p-1">
                <DropdownMenuLabel className="px-3 py-2 text-xs text-gray-500">Brzi linkovi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {infoLinks.map((l) => (
                  <DropdownMenuItem
                    key={l.href}
                    onClick={() => navigate(l.href)}
                    className="px-3 py-2 cursor-pointer rounded-lg"
                  >
                    <span className="text-sm">{l.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`relative rounded-lg ${isColored ? theme.hoverBgColor : 'hover:bg-gray-100'}`}>
                    <Bell className={`w-5 h-5 ${isColored ? theme.textColor : ''}`} />
                    {neprocitaneCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full shadow-sm">
                        {neprocitaneCount > 9 ? '9+' : neprocitaneCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl border-gray-200 p-0 overflow-hidden">
                  <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <span className="font-semibold">Notifikacije</span>
                    {neprocitaneCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs h-7 hover:bg-primary/10 hover:text-primary rounded-md"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Označi sve
                      </Button>
                    )}
                  </DropdownMenuLabel>

                  <ScrollArea className="h-[350px] bg-white">
                    {notifikacije.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-muted-foreground">Nemate notifikacija</p>
                      </div>
                    ) : (
                      notifikacije.slice(0, 10).map((notif) => {
                        const createdAt = notif.created_at ? new Date(notif.created_at) : null;
                        const createdAtLabel =
                          createdAt && !Number.isNaN(createdAt.getTime())
                            ? format(createdAt, 'dd.MM.yyyy. HH:mm')
                            : '';

                        return (
                          <div
                            key={notif.id}
                            className={[
                              'p-3 border-b last:border-0 cursor-pointer transition-colors',
                              'hover:bg-gray-50',
                              !notif.procitano ? 'bg-primary/5' : 'bg-white',
                            ].join(' ')}
                            onClick={() => handleNotificationClick(notif)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{notif.naslov}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.poruka}</p>
                                {createdAtLabel && (
                                  <p className="text-xs text-muted-foreground mt-1.5">{createdAtLabel}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {!notif.procitano && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notif.id);
                                    }}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notif.id);
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 rounded-lg transition-all h-10 pl-1.5 pr-3 ${
                      isColored 
                        ? `border-gray-300 ${theme.hoverBgColor}` 
                        : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shadow-sm ${
                      isColored 
                        ? 'bg-gradient-to-br ' + theme.logoGradient + ' text-white' 
                        : 'bg-gradient-to-br from-primary to-primary/70 text-white'
                    }`}>
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[160px] truncate text-sm font-medium">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-gray-200 p-0 overflow-hidden">
                  <DropdownMenuLabel className="p-3 border-b bg-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold shadow-sm">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{user.name || 'Korisnik'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="py-1 bg-white">
                    <DropdownMenuItem onClick={() => navigate(dashboardLink)} className="px-3 py-2 cursor-pointer">
                      {dashboardIcon}
                      <span className="ml-2 text-sm">{dashboardLabel}</span>
                    </DropdownMenuItem>

                    {user.role === 'doctor' && doctorSlug && (
                      <DropdownMenuItem
                        onClick={() => navigate(`/doktor/${doctorSlug}`)}
                        className="px-3 py-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="ml-2 text-sm">Pogledaj moj profil</span>
                      </DropdownMenuItem>
                    )}

                    {(user.role === 'admin' || user.role === 'doctor') && (
                      <DropdownMenuItem onClick={() => navigate('/my-blog-posts')} className="px-3 py-2 cursor-pointer">
                        <FileText className="w-4 h-4" />
                        <span className="ml-2 text-sm">Moji blog postovi</span>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <DropdownMenuSeparator />

                  <div className="py-1 bg-white">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="px-3 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="ml-2 text-sm">Odjavi se</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className={`rounded-lg shadow-sm hover:shadow transition-all font-medium h-10 px-4 ${
                  isColored 
                    ? `${theme.buttonBg} ${theme.buttonHoverBg}` 
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
              >
                Prijavi se
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className={`rounded-lg ${isColored ? theme.hoverBgColor : 'hover:bg-gray-100'}`}>
                <Menu className={`w-5 h-5 ${isColored ? theme.textColor : ''}`} />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[320px] p-0 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
              <SheetTitle className="sr-only">Navigacija</SheetTitle>
              <SheetDescription className="sr-only">Glavni meni za navigaciju</SheetDescription>

              <div className="flex flex-col h-full">
                {/* Mobile Header - Logo and Close Button */}
                <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
                  <Logo className="h-8" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>

                {/* Mobile User Info - Cyan theme */}
                {user && (
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{user.name || 'Korisnik'}</p>
                        <p className="text-xs text-cyan-600 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation - Modern design */}
                <div className="flex-1 overflow-y-auto py-3 bg-white/50 backdrop-blur-sm">
                  <div className="space-y-1 px-3">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.href);

                      return (
                        <SheetClose asChild key={link.href}>
                          <Link
                            to={link.href}
                            className={[
                              'flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-200',
                              active 
                                ? 'bg-cyan-500 text-white' 
                                : 'text-gray-700 hover:bg-white hover:shadow-md',
                            ].join(' ')}
                          >
                            <div className="flex items-center gap-3">
                              <div className={[
                                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                                active ? 'bg-white/20' : 'bg-cyan-50'
                              ].join(' ')}>
                                <Icon className={['w-5 h-5', active ? 'text-white' : 'text-cyan-600'].join(' ')} />
                              </div>
                              <span className="font-semibold text-sm">{link.label}</span>
                            </div>
                            <ChevronRight className={['w-5 h-5', active ? 'opacity-80' : 'opacity-30'].join(' ')} />
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>

                  {/* Info Links - Cyan theme */}
                  <div className="my-4 mx-3 border-t border-cyan-100" />
                  <div className="px-3 space-y-1">
                    <div className="px-4 py-2 text-xs font-bold text-cyan-600 uppercase tracking-wider">Informacije</div>
                    {infoLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          to={link.href}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                          <span className="font-medium text-sm">{link.label}</span>
                          <ChevronRight className="w-4 h-4 opacity-30" />
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  {user && (
                    <>
                      <div className="my-4 mx-3 border-t border-cyan-100" />
                      <div className="px-3 space-y-1">
                        <SheetClose asChild>
                          <Link
                            to={dashboardLink}
                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 hover:from-cyan-200 hover:to-blue-200 transition-all duration-200 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center">
                                {dashboardIcon}
                              </div>
                              <span className="font-bold text-sm">{dashboardLabel}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-60" />
                          </Link>
                        </SheetClose>

                        {user.role === 'doctor' && doctorSlug && (
                          <SheetClose asChild>
                            <Link
                              to={`/doktor/${doctorSlug}`}
                              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5 text-cyan-600" />
                                <span className="font-medium text-sm">Pogledaj moj profil</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-30" />
                            </Link>
                          </SheetClose>
                        )}

                        {(user.role === 'admin' || user.role === 'doctor') && (
                          <SheetClose asChild>
                            <Link
                              to="/my-blog-posts"
                              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-cyan-600" />
                                <span className="font-medium text-sm">Moji blog postovi</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-30" />
                            </Link>
                          </SheetClose>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Footer - Cyan theme */}
                <div className="p-3 border-t border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50">
                  {user ? (
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold shadow-sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Odjavi se
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-semibold shadow-lg shadow-cyan-500/30"
                    >
                      Prijavi se
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
