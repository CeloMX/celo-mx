'use client';

import { useState } from 'react';
import Section from '@/components/Section';
import FeatureCard from '@/components/FeatureCard';
import Link from 'next/link';
import Image from 'next/image';
import ParallaxBanner from '@/components/ParallaxBanner';
import RegisterButton from '@/components/buildathon/RegisterButton';
import RegisterProjectModal from '@/components/buildathon/RegisterProjectModal';

export default function BuildathonPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#FCF6F1] dark:bg-celo-bg text-celo-fg">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-black dark:border-celo-border/60 bg-[#fcff52] dark:bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,.08),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(252,255,82,.12),transparent_45%)]"></div>
        <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(0,0,0,0.08)_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:12px_12px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-2">
              <h1 className="font-display text-4xl md:text-5xl tracking-tight text-celo-fg">
                Buildathon <span className="brand-em">Celo México</span>
              </h1>
              <p className="mt-4 text-celo-muted max-w-2xl text-lg leading-relaxed">
                Construye el futuro de Web3 en México. Únete a developers, diseñadores y emprendedores para crear soluciones con impacto real en comunidades de México y LATAM.
              </p>
              <div className="h-1 w-20 bg-celo-yellow rounded-full mt-6"></div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group relative overflow-hidden rounded-full border-celo-fg dark:border-celo-yellow border-[0.3px] px-8 py-3 font-bold text-black dark:text-celo-yellow text-xs sm:text-sm bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-celo-yellow focus-visible:ring-offset-0 inline-block"
                >
                  <span className="relative z-10 dark:group-hover:text-black">Registrar Proyecto</span>
                  <span className="pointer-events-none absolute inset-0 m-auto h-full w-full rounded-full bg-[#fcf6f1] scale-0 transition-transform duration-300 ease-out group-hover:scale-150 z-0" />
                </button>
                <Link 
                  href="/academy" 
                  className="group flex items-center gap-2 celo-text font-medium text-sm sm:text-base hover:opacity-80 transition-all duration-200"
                >
                  <span>Explora la Academia</span>
                  <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto lg:max-w-[240px]">
              <Image
                src="https://i.postimg.cc/zvGdrp2g/010.avif"
                alt="Buildathon Celo Mexico"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 200px, 240px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parallax banner between hero and Por qué participar */}
      <ParallaxBanner imageUrl="/buildathon-banner.png" heightClass="h-[70vh] md:h-[80vh]" />

      {/* Por qué participar */}
      <div className="py-12 md:py-16 lg:py-20 bg-[#fcff52] dark:bg-celo-bg">
        <Section title="¿Por qué participar?" subtitle="Razones para unirte al Buildathon Celo Mexico">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              title="Premios y Mentoría" 
              description="Gana suscripciones a Cursor Pro para tu equipo y recibe mentoría continua para llevar tu proyecto al siguiente nivel." 
              icon="ok" 
            />
            <FeatureCard 
              title="Networking" 
              description="Conecta con otros builders, mentores y potenciales colaboradores del ecosistema Celo en México y LATAM." 
              icon="knpo" 
            />
            <FeatureCard 
              title="Mentoría de Expertos" 
              description="Recibe feedback de expertos en blockchain, desarrollo y diseño durante todo el evento para mejorar tu proyecto." 
              icon="pm" 
            />
            <FeatureCard 
              title="Aprende Celo" 
              description="Profundiza en la tecnología de Celo como L2 y construye con las últimas herramientas del ecosistema." 
              icon="ipkm" 
            />
            <FeatureCard 
              title="Exposición Global" 
              description="Tu proyecto será visto por inversores, partners y la comunidad global de Celo alrededor del mundo." 
              icon="ok" 
            />
            <FeatureCard 
              title="Impacto Real" 
              description="Construye soluciones que generen impacto positivo y transformen comunidades de México y LATAM." 
              icon="knpo" 
            />
          </div>
        </Section>
      </div>

      {/* Fechas importantes */}
      <div className="py-12 md:py-16 lg:py-20 border-t border-celo-border/60 bg-[#FCF6F1] dark:bg-celo-bg">
        <Section title="Fechas Importantes" subtitle="Marca estas fechas en tu calendario">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <div className="font-bold text-celo-yellow text-xl sm:text-2xl min-w-[80px]">05 Nov</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl mb-2">Apertura de inscripciones</h3>
                <p className="text-celo-muted leading-relaxed">Las inscripciones están abiertas. ¡Regístrate ahora y asegura tu lugar!</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <div className="font-bold text-celo-yellow text-xl sm:text-2xl min-w-[80px]">05-27 Nov</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl mb-2">Mentorías y Office Hours</h3>
                <p className="text-celo-muted leading-relaxed">Mentorías y Office Hours para ayudarte a construir tu proyecto.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <div className="font-bold text-celo-yellow text-xl sm:text-2xl min-w-[80px]">5 Dic</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl mb-2">Cierre de Inscripciones</h3>
                <p className="text-celo-muted leading-relaxed"> Último día para inscribirte al Buildathon. ¡No te quedes fuera!</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-4 p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <div className="font-bold text-celo-yellow text-xl sm:text-2xl min-w-[80px]">10 Dic</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl mb-2">Anuncio de ganadores</h3>
                <p className="text-celo-muted leading-relaxed">Conoce a los proyectos ganadores y celebra el impacto creado por toda la comunidad.</p>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Premios */}
      <div className="py-12 md:py-16 lg:py-20 border-t border-celo-border/60 bg-[#FCF6F1] dark:bg-celo-bg">
        <Section title="Premios e Incentivos" subtitle="¿Qué puedes ganar?">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 border border-celo-border rounded-lg bg-white/80 dark:bg-celo-bg md:col-span-2 lg:col-span-3">
              <div className="text-3xl font-bold text-celo-yellow mb-2">🎁</div>
              <h3 className="font-semibold text-xl mb-2">Bono de 10 CELO</h3>
              <p className="text-celo-muted mb-3">Regístrate antes del 15 de noviembre y recibe <strong>10 CELO</strong> para desplegar contratos en mainnet y comenzar a hacer transacciones.</p>
              <div className="text-lg font-bold text-celo-yellow">10 CELO</div>
              <p className="text-xs text-celo-muted mt-2">Válido para registros hasta el 15 de noviembre</p>
            </div>
            <div className="p-6 border border-celo-border rounded-lg bg-white/80 dark:bg-celo-bg md:col-span-2 lg:col-span-3">
              <div className="text-3xl font-bold text-celo-yellow mb-2">🏆</div>
              <h3 className="font-semibold text-xl mb-2">Premio a mayor actividad en mainnet</h3>
              <p className="text-celo-muted mb-3">Reconocimiento de <strong>200 cUSD</strong> al equipo que realice más transacciones en Celo mainnet durante el Buildathon.</p>
              <div className="text-lg font-bold text-celo-yellow">200 cUSD</div>
            </div>
            <div className="p-6 border border-celo-border rounded-lg bg-white/80 dark:bg-celo-bg">
              <div className="text-3xl font-bold text-celo-yellow mb-2">🥇</div>
              <h3 className="font-semibold text-xl mb-2">Primer Lugar</h3>
              <p className="text-celo-muted mb-3">3 meses de Cursor Pro + Mentoría continua</p>
              <div className="text-lg font-bold text-celo-yellow">3 meses de Cursor Pro</div>
            </div>
            <div className="p-6 border border-celo-border rounded-lg bg-white/80 dark:bg-celo-bg">
              <div className="text-3xl font-bold text-celo-yellow mb-2">🥈</div>
              <h3 className="font-semibold text-xl mb-2">Segundo Lugar</h3>
              <p className="text-celo-muted mb-3">2 meses de Cursor Pro + Mentoría continua</p>
              <div className="text-lg font-bold text-celo-yellow">2 meses de Cursor Pro</div>
            </div>
            <div className="p-6 border border-celo-border rounded-lg bg-white/80 dark:bg-celo-bg">
              <div className="text-3xl font-bold text-celo-yellow mb-2">🥉</div>
              <h3 className="font-semibold text-xl mb-2">Tercer Lugar</h3>
              <p className="text-celo-muted mb-3">1 mes de Cursor Pro + Mentoría continua</p>
              <div className="text-lg font-bold text-celo-yellow">1 mes de Cursor Pro</div>
            </div>
          </div>
          <div className="mt-8 p-6 border border-celo-border rounded-lg bg-white/50 dark:bg-celo-bg">
            <h3 className="font-semibold text-xl mb-3">Consideraciones Especiales</h3>
            <p className="text-celo-muted mb-4">Habrá consideraciones especiales en proyectos que apliquen el:</p>
            <ul className="list-disc list-inside space-y-2 text-celo-muted">
              <li>Mejor impacto social en comunidades mexicanas</li>
              <li>Mejor uso de tecnología Celo</li>
              <li>Mejor UX/UI para aplicaciones móviles</li>
              <li>Mejor integración con pagos estables</li>
              <li>Mejores integraciones con Self, Mento, Good Dollar, Thirdweb, etc.</li>
            </ul>
          </div>
      <div className="mt-4 p-6 border border-celo-border rounded-lg bg-white/60 dark:bg-celo-bg">
        <h3 className="font-semibold text-xl mb-3">Requisitos para recibir premios e incentivos adicionales</h3>
        <ul className="list-disc list-inside space-y-2 text-celo-muted">
          <li>Repositorio público del proyecto (código abierto).</li>
          <li>Cuenta creada en Karmagap por equipo o repositorio.</li>
          <li>Participación en el Proof of Ship 10 con su entrega.</li>
        </ul>
      </div>
        </Section>
      </div>

      {/* Categorías de proyectos */}
      <div className="py-12 md:py-16 lg:py-20 border-t border-celo-border/60 bg-[#FCF6F1] dark:bg-celo-bg">
        <Section title="Categorías de Proyectos" subtitle="Enfoque: Consumer Apps (aplicaciones para usuarios finales)">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <div className="p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <h3 className="font-semibold text-xl mb-3 text-celo-yellow">💳 Pagos y Finanzas</h3>
              <p className="text-celo-muted leading-relaxed">
                Construye soluciones para pagos móviles, remesas, microfinanzas y acceso a servicios financieros inclusivos.
              </p>
            </div>
            <div className="p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <h3 className="font-semibold text-xl mb-3 text-celo-yellow">🏥 Salud y Bienestar</h3>
              <p className="text-celo-muted leading-relaxed">
                Desarrolla aplicaciones para gestión de salud, seguros comunitarios y acceso a servicios de salud.
              </p>
            </div>
            <div className="p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <h3 className="font-semibold text-xl mb-3 text-celo-yellow">🌾 Impacto y Sostenibilidad</h3>
              <p className="text-celo-muted leading-relaxed">
                Crea herramientas para consumidores y comunidades con impacto ambiental positivo y cadenas de suministro trazables.
              </p>
            </div>
            <div className="p-6 border border-celo-border rounded-lg hover:border-celo-yellow/50 transition-colors">
              <h3 className="font-semibold text-xl mb-3 text-celo-yellow">🛍️ Consumo y Comercio</h3>
              <p className="text-celo-muted leading-relaxed">
                Apps para usuarios finales: comercio local, lealtad, cupones, memberships y experiencias móviles orientadas al día a día.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* CTA Final */}
      <div className="py-12 md:py-16 lg:py-20 border-t border-celo-border/60 bg-[#FCF6F1] dark:bg-celo-bg">
        <Section title="">
          <div className="text-center py-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-celo-fg">
              ¿Listo para construir el futuro?
            </h2>
            <p className="text-lg text-celo-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              No pierdas la oportunidad de ser parte del futuro de Web3 en México. Únete a otros builders apasionados y crea algo increíble.
            </p>
            <RegisterButton />
            <p className="mt-6 text-sm text-celo-muted">
              Las inscripciones son limitadas • Registro gratuito
            </p>
          </div>
        </Section>
      </div>

      <RegisterProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}

