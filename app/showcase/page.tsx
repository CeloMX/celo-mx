import Link from 'next/link';
import projects from './projects.json';

function previewImageUrl(url: string) {
  const width = 1200;
  const height = 630;
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${width}&h=${height}`;
}

export default function ShowcasePage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-celoLegacy-yellow/20 dark:bg-celoLegacy-yellow/10 rounded-full blur-xl" />
              <div className="relative bg-celo-bg border-2 border-celo-border rounded-full px-6 py-2">
                <span className="text-celo-yellow font-bold text-sm">Proyectos impulsados por Celo México</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-celo-fg">
            Aceleramos productos con AA, gasless y pagos en cUSD
          </h1>
          <p className="mt-3 text-celo-muted max-w-3xl mx-auto">
            Ayudamos a equipos a lanzar experiencias cripto sin fricción: wallets con Account Abstraction,
            patrocinar gas, onramps y flujos de onboarding listos para producción.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Account Abstraction</span>
            <span className="text-xs px-3 py-1 rounded-full bg-celoLegacy-yellow/15 text-celo-yellow border border-celo-yellow/30">Gasless</span>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">Onboarding</span>
            <span className="text-xs px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">Pagos cUSD</span>
          </div>
        </section>

        {/* Qué hacemos (sin números inventados) */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-celo-fg mb-3">Qué hacemos con cada equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-celo-bg border border-celo-border rounded-xl p-5">
              <h3 className="font-medium text-celo-fg mb-2">Wallet + Account Abstraction</h3>
              <p className="text-sm text-celo-muted">Smart accounts, sesiones con passkeys y UX web‑like sin extensiones.</p>
            </div>
            <div className="bg-celo-bg border border-celo-border rounded-xl p-5">
              <h3 className="font-medium text-celo-fg mb-2">Onboarding y Pagos</h3>
              <p className="text-sm text-celo-muted">Onramps, pagos en cUSD y flujos simples para usuarios no‑cripto.</p>
            </div>
            <div className="bg-celo-bg border border-celo-border rounded-xl p-5">
              <h3 className="font-medium text-celo-fg mb-2">Infra y Delivery</h3>
              <p className="text-sm text-celo-muted">Monitoreo, analytics, auth y playbooks de lanzamiento.</p>
            </div>
          </div>
        </section>

        {/* Grid de proyectos con preview directo (como antes) */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-celo-fg mb-4">Proyectos activos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <article key={p.slug} className="bg-celo-bg border border-celo-border rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="relative aspect-[1200/630] bg-neutral-100 dark:bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImageUrl(p.url)}
                    alt={p.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-celo-fg mb-2">{p.title}</h3>
                  <p className="text-sm text-celo-muted mb-4 line-clamp-3">{p.description}</p>
                  {p.tags?.length ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {p.tags.map((t: string) => (
                        <span key={t} className="text-xs px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="text-xs text-celo-muted">
                      {p.metadata?.chain && <span className="mr-3">Chain: {p.metadata.chain}</span>}
                      {p.metadata?.category && <span>Categoria: {p.metadata.category}</span>}
                    </div>
<a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium px-3 py-2 rounded-lg border border-celo-yellow bg-black text-white hover:bg-neutral-900 dark:bg-celoLegacy-yellow dark:text-black dark:hover:bg-celoLegacy-yellow/90">
                      Visitar
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-celo-bg border border-celo-border rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-2xl font-display font-bold text-celo-fg">¿Quieres lanzar sobre Celo?</h3>
          <p className="text-celo-muted mt-2 max-w-2xl mx-auto">Integramos AA, gasless, pagos y UX lista para producción. Escríbenos y arrancamos.</p>
<a href="https://t.me/celomexico" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-sm font-medium px-5 py-2 rounded-lg border border-celo-yellow bg-black text-white hover:bg-neutral-900 dark:bg-celoLegacy-yellow dark:text-black dark:hover:bg-celoLegacy-yellow/90">Hablar con el equipo</a>
        </section>
      </div>
    </div>
  );
}
