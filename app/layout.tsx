import './globals.css';
import type { ReactNode } from 'react';
import { Header } from '../components/Header';
import { Providers } from '../components/Providers';

export const metadata = {
  title: 'Burgerito • Catalogue',
  description: 'Application e-commerce Burgerito'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-8 min-h-[60vh]">
            {children}
          </main>
          <footer className="text-center text-xs py-10 opacity-50">
            Burgerito
          </footer>
        </Providers>
      </body>
    </html>
  );
}
