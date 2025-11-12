import projects from './projects.json';
import { ProjectCard } from '@/components/showcase/ProjectCard';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header styled similarly to paywall tone */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-celo-yellow/20 dark:bg-celo-yellow/10 rounded-full blur-xl" />
            <div className="relative bg-celo-bg border-2 border-celo-border rounded-full px-6 py-3">
              <span className="text-celo-yellow font-bold">Showcase</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-celo-fg">
            Proyectos destacados del ecosistema
          </h1>
          <p className="mt-2 text-celo-muted max-w-2xl">
            Lista curada de proyectos en los que estamos trabajando o apoyando. Cada tarjeta se genera desde un JSON para hacerlo fácil de mantener.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p as any} />
          ))}
        </div>
      </div>
    </div>
  );
}