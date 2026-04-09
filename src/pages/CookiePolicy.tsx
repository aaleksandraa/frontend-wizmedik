import { Helmet } from 'react-helmet-async';
import { Cookie, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import {
  COOKIE_CATEGORIES,
  COOKIE_TECHNOLOGIES,
  formatConsentDate,
  getCookieStatusLabel,
} from '@/lib/cookie-consent';

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  conditional: 'bg-sky-50 text-sky-700 border-sky-200',
  planned: 'bg-amber-50 text-amber-700 border-amber-200',
} as const;

export default function CookiePolicy() {
  const { consentRecord, openPreferences } = useCookieConsent();

  return (
    <>
      <Helmet>
        <title>Politika kolacica - wizMedik</title>
        <meta
          name="description"
          content="Pregled svih kolacica i slicnih tehnologija koje WizMedik koristi, njihove svrhe, trajanja i postavki pristanka."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <section className="bg-gradient-to-br from-cyan-700 via-cyan-600 to-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <Cookie className="h-4 w-4" />
                Politika kolacica i slicnih tehnologija
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Jasne postavke privatnosti i potpun pregled tehnologija
              </h1>

              <p className="mt-5 text-lg leading-8 text-white/85">
                Ovdje su navedeni svi kolacici, localStorage i sessionStorage zapisi, kao i opcioni alati za
                funkcionalnost, analitiku i buduce marketinske integracije koje WizMedik koristi ili ima spremne.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={openPreferences}
                  className="rounded-xl bg-white text-cyan-800 hover:bg-slate-100"
                >
                  Upravljaj kolacicima
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                >
                  <a href="/privacy-policy">Politika privatnosti</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1.45fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Vasa trenutna odluka</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Neophodne tehnologije ostaju ukljucene radi rada platforme. Sve ostalo zavisi od vaseg pristanka.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {COOKIE_CATEGORIES.map((category) => {
                  const enabled = category.isRequired ? true : Boolean(consentRecord?.preferences[category.key]);

                  return (
                    <div key={category.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{category.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{category.shortDescription}</p>
                      <span
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {enabled ? 'Ukljuceno' : 'Iskljuceno'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <p>
                  Zadnji put sacuvano:
                  <span className="ml-2 font-medium text-slate-900">
                    {consentRecord ? formatConsentDate(consentRecord.savedAt) : 'jos nije odabrano'}
                  </span>
                </p>
                <p className="mt-2">
                  Ako u buducnosti uvedemo Meta/Facebook Pixel ili dataset integraciju, ona ce biti smjestena u
                  marketinsku kategoriju i nece se aktivirati bez zasebnog pristanka.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Kako koristimo kolacice i slicne tehnologije</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Na WizMedik platformi koristimo kombinaciju browser kolacica, localStorage i sessionStorage zapisa.
                  Neophodni zapisi podrzavaju prijavu, sigurnost i antispam logiku. Opcioni zapisi se aktiviraju samo
                  nakon pristanka i sluze za funkcionalne preference ili analitiku.
                </p>
                <p>
                  Ove postavke mozete promijeniti u bilo kojem trenutku preko linka <strong>Upravljaj kolacicima</strong>{' '}
                  u futeru. Kada iskljucite vec aktivne opcione tehnologije, aplikacija se moze kratko osvjeziti kako
                  bi promjena bila sigurno primijenjena.
                </p>
                <p>
                  Ako obrisete podatke pregledaca ili promijenite uredjaj, ponovo cemo vas pitati za izbor. Odluka o
                  kolacicima se inace cuva 6 mjeseci.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-semibold text-slate-900">Detaljan pregled svih tehnologija</h2>
              <p className="text-sm leading-6 text-slate-600">
                Spisak ispod prikazuje naziv, dobavljaca, vrstu pohrane, okvirno trajanje i svrhu svake tehnologije
                koju trenutno koristimo ili smo unaprijed pripremili za buducu aktivaciju.
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {COOKIE_TECHNOLOGIES.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                          {COOKIE_CATEGORIES.find((category) => category.key === item.category)?.title}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyles[item.status]}`}>
                          {getCookieStatusLabel(item)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.purpose}</p>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:min-w-[420px]">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Provider</p>
                        <p className="mt-1 font-medium text-slate-900">{item.provider}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vrsta pohrane</p>
                        <p className="mt-1 font-medium text-slate-900">{item.storage}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trajanje</p>
                        <p className="mt-1 font-medium text-slate-900">{item.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
