'use client';

import { useState } from 'react';
import projects from './projects.json';

function previewImageUrl(url: string, customImage?: string, useFallback = false) {
  if (customImage) {
    return customImage;
  }
  const width = 1200;
  const height = 630;
  
  if (useFallback) {
    // Servicio alternativo público (thum.io)
    return `https://image.thum.io/get/width/${width}/crop/${height}/${url}`;
  }
  
  // Servicio principal: WordPress mshots
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

        {/* Componente para renderizar un proyecto */}
        {(() => {
          const ProjectCard = ({ project }: { project: typeof projects[0] }) => {
            const ProjectImage = ({ project }: { project: typeof project }) => {
              const [imgSrc, setImgSrc] = useState(previewImageUrl(project.url, (project as any).image, false));
              const [errorCount, setErrorCount] = useState(0);
              const [showPlaceholder, setShowPlaceholder] = useState(false);

              const handleError = () => {
                if (errorCount === 0) {
                  setErrorCount(1);
                  setImgSrc(previewImageUrl(project.url, (project as any).image, true));
                } else {
                  setShowPlaceholder(true);
                }
              };

              return (
                <div className="relative aspect-[1200/630] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  {showPlaceholder ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-celoLegacy-yellow/10 to-celoLegacy-yellow/5 border-2 border-dashed border-celo-yellow/30">
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">🌐</div>
                        <p className="text-xs text-celo-muted">{project.title}</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imgSrc}
                      alt={project.title}
                      className="object-cover w-full h-full"
                      loading="lazy"
                      onError={handleError}
                    />
                  )}
                </div>
              );
            };

            return (
              <article className="bg-celo-bg border border-celo-border rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <ProjectImage project={project} />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-celo-fg mb-2">{project.title}</h3>
                  <p className="text-sm text-celo-muted mb-4 line-clamp-3">{project.description}</p>
                  {project.metadata?.team && (
                    <p className="text-xs text-celo-muted mb-3 italic">
                      Por: {project.metadata.team}
                    </p>
                  )}
                  {project.tags?.length ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((t: string) => (
                        <span key={t} className="text-xs px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="text-xs text-celo-muted">
                      {project.metadata?.chain && <span className="mr-3">Chain: {project.metadata.chain}</span>}
                      {project.metadata?.category && <span>Categoria: {project.metadata.category}</span>}
                    </div>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium px-3 py-2 rounded-lg border border-celo-yellow bg-black text-white hover:bg-neutral-900 dark:bg-celoLegacy-yellow dark:text-black dark:hover:bg-celoLegacy-yellow/90">
                      Visitar
                    </a>
                  </div>
                </div>
              </article>
            );
          };

          const newProjects = projects.filter((p: any) => p.status === 'new');
          const activeProjects = projects.filter((p: any) => p.status === 'active');
          const buildingProjects = projects.filter((p: any) => p.status === 'building');

          return (
            <>
              {/* Proyectos nuevos */}
              {newProjects.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-celo-fg mb-4">Proyectos nuevos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newProjects.map((p) => (
                      <ProjectCard key={p.slug} project={p} />
                    ))}
                  </div>
                </section>
              )}

              {/* Proyectos activos */}
              {activeProjects.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-celo-fg mb-4">Proyectos activos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProjects.map((p) => (
                      <ProjectCard key={p.slug} project={p} />
                    ))}
                  </div>
                </section>
              )}

              {/* Proyectos en construcción */}
              {buildingProjects.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-celo-fg mb-4">Proyectos en construcción</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buildingProjects.map((p) => (
                      <ProjectCard key={p.slug} project={p} />
                    ))}
                  </div>
                </section>
              )}
            </>
          );
        })()}

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
