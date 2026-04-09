import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, Clock3, Cookie, Database, Megaphone, Settings2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import {
  COOKIE_CATEGORIES,
  CookieConsentCategory,
  CookieConsentPreferences,
  formatConsentDate,
  getCookieStatusLabel,
  getCookieTechnologiesByCategory,
} from '@/lib/cookie-consent';
import { cn } from '@/lib/utils';

const categoryIconMap = {
  essential: Shield,
  functional: Settings2,
  analytics: BarChart3,
  marketing: Megaphone,
} satisfies Record<CookieConsentCategory, ComponentType<{ className?: string }>>;

const badgeClassMap = {
  essential: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  functional: 'bg-sky-50 text-sky-700 border-sky-200',
  analytics: 'bg-violet-50 text-violet-700 border-violet-200',
  marketing: 'bg-amber-50 text-amber-700 border-amber-200',
} satisfies Record<CookieConsentCategory, string>;

function TechnologyCard({
  name,
  provider,
  storage,
  duration,
  purpose,
  statusLabel,
  category,
}: {
  name: string;
  provider: string;
  storage: string;
  duration: string;
  purpose: string;
  statusLabel: string;
  category: CookieConsentCategory;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{provider}</p>
        </div>
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', badgeClassMap[category])}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-slate-400" />
          <span>{storage}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-slate-400" />
          <span>{duration}</span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{purpose}</p>
    </div>
  );
}

function CategoryPreferenceCard({
  category,
  checked,
  disabled,
  onToggle,
}: {
  category: (typeof COOKIE_CATEGORIES)[number];
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const Icon = categoryIconMap[category.key];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={cn('mt-0.5 rounded-xl border p-2', badgeClassMap[category.key])}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{category.title}</h3>
              {category.isRequired ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Uvijek aktivno
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">{category.shortDescription}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{category.description}</p>
          </div>
        </div>

        <Switch checked={checked} onCheckedChange={onToggle} disabled={disabled} aria-label={category.title} />
      </div>
    </div>
  );
}

export function CookieConsent() {
  const {
    consentRecord,
    preferences,
    settings,
    loadingSettings,
    hasDecision,
    isPreferencesOpen,
    setPreferencesOpen,
    acceptAll,
    rejectOptional,
    savePreferences,
  } = useCookieConsent();

  const [draftPreferences, setDraftPreferences] = useState<CookieConsentPreferences>(preferences);

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraftPreferences(preferences);
    }
  }, [isPreferencesOpen, preferences]);

  const shouldShowBanner = !loadingSettings && settings.enabled && !hasDecision;

  const groupedTechnologies = useMemo(
    () =>
      COOKIE_CATEGORIES.map((category) => ({
        category,
        items: getCookieTechnologiesByCategory(category.key),
      })),
    [],
  );

  const handleToggle = (category: CookieConsentCategory) => {
    if (category === 'essential') {
      return;
    }

    setDraftPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSavePreferences = () => {
    savePreferences(draftPreferences, hasDecision ? 'settings' : 'banner');
  };

  return (
    <>
      {shouldShowBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-[9997] px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/96 p-4 shadow-2xl backdrop-blur md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-50 p-2.5 text-cyan-700">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Postavke kolacica i privatnosti</p>
                    <p className="text-xs text-slate-500">Neophodni alati rade uvijek, a ostale birate sami.</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{settings.text}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    U svakom trenutku mozete promijeniti izbor iz futera
                  </span>
                  <Link to="/cookie-policy" className="font-medium text-cyan-700 hover:text-cyan-800 hover:underline">
                    Detaljna politika kolacica
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                <Button variant="ghost" onClick={() => setPreferencesOpen(true)} className="justify-center rounded-xl">
                  Prilagodi
                </Button>
                <Button variant="outline" onClick={() => rejectOptional('banner')} className="rounded-xl">
                  {settings.reject_button || 'Odbij opcione'}
                </Button>
                <Button onClick={() => acceptAll('banner')} className="rounded-xl bg-cyan-600 text-white hover:bg-cyan-700">
                  {settings.accept_button || 'Prihvati sve'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={isPreferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="max-w-6xl gap-0 overflow-hidden border-none p-0 shadow-2xl">
          <div className="grid max-h-[90vh] grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_1.35fr]">
            <div className="overflow-y-auto border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 lg:border-b-0 lg:border-r">
              <DialogHeader className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-slate-900">Upravljanje kolacicima</DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-slate-600">
                      Birate koje opcione tehnologije dozvoljavate. Neophodne ostaju ukljucene radi rada platforme.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <p>
                  Zadnja odluka:
                  <span className="ml-2 font-medium text-slate-900">
                    {consentRecord ? formatConsentDate(consentRecord.savedAt) : 'jos nije sacuvana'}
                  </span>
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Ako promijenite vec postojeci izbor, stranica se moze kratko osvjeziti kako bi optional alati bili
                  sigurno ukljuceni ili iskljuceni.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {COOKIE_CATEGORIES.map((category) => (
                  <CategoryPreferenceCard
                    key={category.key}
                    category={category}
                    checked={draftPreferences[category.key]}
                    disabled={category.isRequired}
                    onToggle={() => handleToggle(category.key)}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-900">Napomena o marketing alatima</p>
                <p className="mt-2">
                  Trenutno nemamo aktivan Meta/Facebook Pixel niti dataset integraciju. Kada ih uvedemo, ostace u
                  kategoriji marketing i nece se pokretati bez vaseg pristanka.
                </p>
              </div>

              <DialogFooter className="mt-6 flex-col gap-2 sm:flex-col sm:space-x-0">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => rejectOptional(hasDecision ? 'settings' : 'banner')} className="flex-1 rounded-xl">
                    Odbij opcione
                  </Button>
                  <Button variant="outline" onClick={() => setPreferencesOpen(false)} className="flex-1 rounded-xl">
                    Zatvori
                  </Button>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => acceptAll(hasDecision ? 'settings' : 'banner')}
                    className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Prihvati sve
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    className="flex-1 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    Sacuvaj izbor
                  </Button>
                </div>
              </DialogFooter>
            </div>

            <div className="overflow-y-auto bg-white p-6">
              <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
                <h3 className="text-lg font-semibold text-slate-900">Pregled tehnologija i trajanja</h3>
                <p className="text-sm leading-6 text-slate-600">
                  Ispod je pregled svih trenutnih zapisa, kolacica i slicnih tehnologija koje WizMedik koristi ili ima
                  spremne za buducu integraciju.
                </p>
              </div>

              <div className="mt-6 space-y-6">
                {groupedTechnologies.map(({ category, items }) => (
                  <section key={category.key} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={cn('rounded-xl border p-2', badgeClassMap[category.key])}>
                        {(() => {
                          const Icon = categoryIconMap[category.key];
                          return <Icon className="h-4 w-4" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{category.title}</h4>
                        <p className="text-xs text-slate-500">{category.shortDescription}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-2">
                      {items.map((item) => (
                        <TechnologyCard
                          key={item.id}
                          name={item.name}
                          provider={item.provider}
                          storage={item.storage}
                          duration={item.duration}
                          purpose={item.purpose}
                          statusLabel={getCookieStatusLabel(item)}
                          category={category.key}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <p>
                  Zelite detaljnije informacije o obradi podataka, pravnom osnovu i kontaktima za privatnost? Pogledajte{' '}
                  <Link to="/privacy-policy" className="font-medium text-cyan-700 hover:text-cyan-800 hover:underline">
                    Politiku privatnosti
                  </Link>{' '}
                  i{' '}
                  <Link to="/cookie-policy" className="font-medium text-cyan-700 hover:text-cyan-800 hover:underline">
                    Politiku kolacica
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
