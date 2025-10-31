import FormSubscribe from './FormSubscribe';
import CeloLogo from './CeloLogo';

export default function Footer() {
  return (
    <footer className="bg-celo-bg text-celo-fg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Top Section with Logo */}
        <div className="mb-12">
          <div className="flex items-center gap-3">
            <CeloLogo width={200} height={45} className="text-celo-black" />
            <span className="font-italic text-2xl sm:text-3xl text-celo-black">
              Mexico
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
          {/* Left Section - Newsletter */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display mb-6">
              Ideas que cambian el mundo en tu bandeja de entrada
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-3 rounded-lg border border-celo-border bg-white text-celo-black placeholder-celo-gray-500 focus:outline-none focus:ring-2 focus:ring-celo-lime"
              />
              <button className="px-6 py-3 bg-celo-black text-white rounded-lg hover:bg-celo-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-celo-gray-700">
              Al proporcionar tu email, consientes recibir comunicaciones de Celo Foundation. 
              Visita nuestra <a href="#" className="underline hover:no-underline">Política de Privacidad</a> para más información.
            </p>
          </div>

          {/* Right Section - Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {/* Celo para */}
            <div>
              <h3 className="font-display text-lg mb-4">Celo para</h3>
            <div className="space-y-2">
                <a href="https://developers.celo.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Desarrolladores
                </a>
                <a href="https://ai.celo.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  IA
                </a>
              </div>
            </div>

            {/* Tecnología */}
            <div>
              <h3 className="font-display text-lg mb-4">Tecnología</h3>
              <div className="space-y-2">
                <a href="https://docs.celo.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Documentación
                </a>
                <a href="https://reserve.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Reserva
                </a>
                <a href="https://mondo.celo.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Celo Mondo
                </a>
              </div>
            </div>

            {/* Empresa */}
            <div>
              <h3 className="font-display text-lg mb-4">Empresa</h3>
              <div className="space-y-2">
                <a href="https://celo.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Fundación
                </a>
                <a href="https://celo.org/papers" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Documentos Técnicos
                </a>
              </div>
            </div>

            {/* Recursos */}
            <div>
              <h3 className="font-display text-lg mb-4">Recursos</h3>
              <div className="space-y-2">
                <a href="https://brand.celo.org/" target="_blank" rel="noopener noreferrer" className="block px-2 py-1 bg-transparent border border-celo-border rounded-full text-xs font-bold hover:bg-celo-black hover:text-celoLegacy-yellow transition-colors text-center whitespace-normal">
                  Kit de Marca
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Social, Copyright, Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-celo-border">
          {/* Social Media Icons */}
          <div className="flex gap-3">
            <a href="https://x.com/CeloOrg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-celo-border rounded-full flex items-center justify-center transition-colors bg-black text-celoLegacy-yellow dark:bg-celoLegacy-yellow dark:text-black">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/celoorg/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-celo-border rounded-full flex items-center justify-center transition-colors bg-black text-celoLegacy-yellow dark:bg-celoLegacy-yellow dark:text-black">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
              </svg>
            </a>
            <a href="https://github.com/celo-org" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-celo-border rounded-full flex items-center justify-center transition-colors bg-black text-celoLegacy-yellow dark:bg-celoLegacy-yellow dark:text-black">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://forum.celo.org/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-celo-border rounded-full flex items-center justify-center transition-colors bg-black text-celoLegacy-yellow dark:bg-celoLegacy-yellow dark:text-black">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm">
            © 2025 Celo Mexico
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:underline">Configuración de Cookies</a>
            <a href="#" className="hover:underline">Política de Privacidad</a>
            <a href="#" className="hover:underline">Términos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



