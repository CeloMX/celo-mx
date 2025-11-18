'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Project = {
  slug: string;
  title: string;
  url: string;
  description: string;
  tags?: string[];
  metadata?: { chain?: string; category?: string };
  thumbnail?: string;
};

function screenshotUrl(url: string) {
  // Immediate, keyless screenshot so we never show a spinner for long
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=630`;
}

export function ProjectCard({ project }: { project: Project }) {
  const [img, setImg] = useState<string | null>(project.thumbnail ?? null);

  useEffect(() => {
    let mounted = true;
    // Set quick screenshot first for instant feedback
    if (!project.thumbnail) {
      setImg(screenshotUrl(project.url));
    }

    // Try to upgrade to og:image quickly with a short timeout
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2000);

    (async () => {
      try {
        const q = new URLSearchParams({ url: project.url }).toString();
        const res = await fetch(`/api/preview?${q}`, { cache: 'no-store', signal: controller.signal });
        const data = await res.json();
        if (mounted && data?.imageUrl) setImg(data.imageUrl);
      } catch {
        // keep the screenshot fallback
      } finally {
        clearTimeout(t);
      }
    })();

    return () => { mounted = false; controller.abort(); clearTimeout(t); };
  }, [project.url, project.thumbnail]);

  return (
    <article className="bg-celo-bg border border-celo-border rounded-2xl overflow-hidden shadow-lg flex flex-col">
      <div className="relative aspect-[1200/630] bg-neutral-100 dark:bg-neutral-900">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={project.title} className="object-cover w-full h-full" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-celo-muted">
            Sin vista previa
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-xl font-semibold text-celo-fg mb-2">{project.title}</h2>
        <p className="text-sm text-celo-muted mb-4 line-clamp-3">{project.description}</p>

        {project.tags?.length ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((t) => (
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
<a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium px-3 py-2 rounded-lg border border-celo-yellow bg-black text-celo-yellow hover:bg-neutral-900 dark:bg-celoLegacy-yellow dark:text-black dark:hover:bg-celoLegacy-yellow/90">
            Visitar
          </a>
        </div>
      </div>
    </article>
  );
}