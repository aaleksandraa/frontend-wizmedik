import { Link } from 'react-router-dom';
import {
  Heart,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Stethoscope,
  Building2,
  FlaskConical,
  Droplet,
  Home as HomeIcon,
  BookOpen,
  HelpCircle,
  FileText,
  Calculator,
  MapPin,
} from 'lucide-react';
import { useLogoSettings } from '@/hooks/useLogoSettings';

const searchLinks = [
  { to: '/doktori', label: 'Doktori', icon: Stethoscope },
  { to: '/klinike', label: 'Klinike', icon: Building2 },
  { to: '/laboratorije', label: 'Laboratorije', icon: FlaskConical },
  { to: '/banje', label: 'Banje', icon: Droplet },
  { to: '/domovi-njega', label: 'Domovi njege', icon: HomeIcon },
  { to: '/specijalnosti', label: 'Specijalnosti', icon: Stethoscope },
  { to: '/gradovi', label: 'Gradovi', icon: MapPin },
];

const resourceLinks = [
  { to: '/blog', label: 'Blog', icon: FileText },
  { to: '/pitanja', label: 'Pitanja', icon: HelpCircle },
  { to: '/medicinski-kalendar', label: 'Med. Kalendar', icon: BookOpen },
  { to: '/kalkulatori', label: 'Kalkulatori', icon: Calculator },
  { to: '/mkb10', label: 'MKB-10', icon: BookOpen },
  { to: '/banje/indikacije-terapije', label: 'Indikacije', icon: Droplet },
  { to: '/domovi-njega/vodic', label: 'Vodič', icon: HomeIcon },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
];

const registrationLinks = [
  { to: '/register/doctor', label: 'Za Doktore' },
  { to: '/register/clinic', label: 'Za Klinike' },
  { to: '/register/laboratory', label: 'Za Laboratorije' },
  { to: '/register/spa', label: 'Za Banje' },
  { to: '/register/care-home', label: 'Za Domove' },
];

function FooterItem({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="size-compact h-7 inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm leading-none"
    >
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0 text-slate-500/90" />
      ) : null}
      <span className="leading-none">{label}</span>
    </Link>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings: logoSettings, loading: logoLoading } = useLogoSettings();

  // Footer Logo Component
  const FooterLogo = () => {
    if (logoLoading) {
      return (
        <div className="flex items-center gap-2 justify-center lg:justify-start">
          <div className="h-10 w-32 bg-slate-800 animate-pulse rounded" />
        </div>
      );
    }

    if (!logoSettings.footer_logo_enabled) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 justify-center lg:justify-start">
        {logoSettings.show_heart_icon && (
          <div className="p-2 rounded-xl bg-[rgb(8,145,178)]/10">
            <Heart className="w-6 h-6" style={{ color: 'rgb(8, 145, 178)' }} />
          </div>
        )}
        {logoSettings.footer_logo_type === 'text' || !logoSettings.footer_logo_url ? (
          <div className="flex items-center gap-1 text-2xl font-bold">
            <span style={{ color: 'rgb(8, 145, 178)' }}>Wiz</span>
            <span className="text-white">Medik</span>
          </div>
        ) : (
          <img
            src={logoSettings.footer_logo_url}
            alt="wizMedik"
            style={{
              height: '70px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 overflow-hidden w-full">
      <div className="w-full max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* =========================
            MOBILE (modernized)
           ========================= */}
        <div className="md:hidden">
          {/* Top company block */}
          <div className="text-center">
            <div className="mb-3">
              <FooterLogo />
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              Moderna platforma za povezivanje pacijenata sa najboljim doktorima i klinikama u BiH.
            </p>

            <div className="flex gap-2 justify-center mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Mobile sections as compact cards */}
          <div className="mt-7 grid gap-3">
            <section className="rounded-xl border border-slate-700/40 bg-slate-900/20 p-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider text-center mb-3">
                Pretraži
              </h3>
              {/* Manji razmak: gap-y-0 + fiksna visina linka (h-7) */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                {searchLinks.map((l) => (
                  <FooterItem key={l.to} to={l.to} label={l.label} Icon={l.icon} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-700/40 bg-slate-900/20 p-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider text-center mb-3">
                Resursi
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                {resourceLinks.map((l) => (
                  <FooterItem key={l.to} to={l.to} label={l.label} Icon={l.icon} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-700/40 bg-slate-900/20 p-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider text-center mb-3">
                Registracija
              </h3>
              {/* Centrirano + wrap po širini, ali KOMPAKTNO (gap-y-0, h-7) */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-0 justify-items-center">
                {registrationLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="size-compact h-7 inline-flex items-center text-slate-400 hover:text-primary transition-colors text-sm leading-none"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-700/40 bg-slate-900/20 p-4 text-center">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Kontakt
              </h3>

              {/* Ikonica i tekst poravnati */}
              <div className="flex justify-center">
                <a
                  href="mailto:info@wizmedik.com"
                  className="size-compact inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors leading-none"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="leading-none">info@wizmedik.com</span>
                </a>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60">
                <Link
                  to="/about"
                  className="size-compact text-slate-400 hover:text-primary transition-colors text-sm inline-flex items-center gap-1 group justify-center leading-none"
                >
                  <span>O wizMedik</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </section>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-6 mt-8">
            <div className="flex flex-col items-center gap-4">
              <p className="text-slate-500 text-xs text-center">
                © {currentYear} <span className="text-slate-400">wizMedik</span>. Sva prava zadržana.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <Link to="/privacy-policy" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Privatnost
                </Link>
                <Link to="/terms-of-service" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Uslovi
                </Link>
                <Link to="/cookie-policy" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Kolačići
                </Link>
                <Link to="/contact" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            DESKTOP / TABLET
           ========================= */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-8 w-full">
            {/* Company */}
            <div className="col-span-1 md:col-span-4 lg:col-span-1 text-center lg:text-left">
              <div className="mb-3">
                <FooterLogo />
              </div>
              <p className="text-slate-400 mb-4 text-sm leading-relaxed max-w-xs mx-auto lg:mx-0">
                Moderna platforma za povezivanje pacijenata sa najboljim doktorima i klinikama u BiH.
              </p>
              <div className="flex gap-2 justify-center lg:justify-start">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Pretraži (tight spacing) */}
            <div className="md:col-span-1">
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Pretraži</h3>
              <div className="grid grid-cols-1 gap-y-0">
                {searchLinks.map((l) => (
                  <FooterItem key={l.to} to={l.to} label={l.label} Icon={l.icon} />
                ))}
              </div>
            </div>

            {/* Resursi (tight spacing) */}
            <div className="md:col-span-1">
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Resursi</h3>
              <div className="grid grid-cols-1 gap-y-0">
                {resourceLinks.map((l) => (
                  <FooterItem key={l.to} to={l.to} label={l.label} Icon={l.icon} />
                ))}
              </div>
            </div>

            {/* Registracija (tight spacing) */}
            <div className="md:col-span-1">
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Registracija</h3>
              <div className="grid grid-cols-1 gap-y-0">
                {registrationLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="size-compact h-7 inline-flex items-center text-slate-400 hover:text-primary transition-colors text-sm leading-none"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Kontakt (email only) + About */}
            <div className="md:col-span-1">
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Kontakt</h3>
              <a
                href="mailto:info@wizmedik.com"
                className="size-compact h-7 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors leading-none"
              >
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="leading-none">info@wizmedik.com</span>
              </a>

              <div className="mt-4 pt-3 border-t border-slate-700">
                <Link
                  to="/about"
                  className="size-compact text-slate-400 hover:text-primary transition-colors text-sm inline-flex items-center gap-1 group leading-none"
                >
                  <span>O wizMedik</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-6 mt-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-xs text-center sm:text-left">
                © {currentYear} <span className="text-slate-400">wizMedik</span>. Sva prava zadržana.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs">
                <Link to="/privacy-policy" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Privatnost
                </Link>
                <Link to="/terms-of-service" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Uslovi
                </Link>
                <Link to="/cookie-policy" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Kolačići
                </Link>
                <Link to="/contact" className="size-compact text-slate-500 hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
