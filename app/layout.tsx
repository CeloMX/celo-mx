import type { Metadata } from 'next';
import { Inter, Crimson_Pro } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ContractDebug } from '@/components/debug/ContractDebug';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['200', '300'],
  variable: '--font-title',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'CELO México',
  description: 'Celo México: el hub para builders y comunidad.',
  icons: {
    icon: '/icons/celomx logo.png',
    shortcut: '/icons/celomx logo.png',
    apple: '/icons/celomx logo.png',
  },
  openGraph: {
    title: 'CELO Mexico',
    description: 'Celo Mexico: el hub para builders y comunidad.',
    type: 'website',
    url: 'https://celo-mexico.local',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CELO Mexico',
    description: 'Celo Mexico: el hub para builders y comunidad.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        
      </head>
      <body className={`${inter.variable} ${crimsonPro.variable} min-h-screen antialiased bg-celo-bg text-celo-fg font-sans`}>
        <ThemeProvider>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 overflow-x-hidden">{children}</main>
              <Footer />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
