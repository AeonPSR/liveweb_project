import './globals.css';
import type { ReactNode } from 'react';
import { Header } from '../components/Header';

export const metadata = {
  title: 'Burgerito • Catalogue',
  description: 'Application e-commerce Burgerito (Sprint 1)'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8 min-h-[60vh]">
          {children}
        </main>
        <footer className="text-center text-xs py-10 opacity-50">
          Sprint 1 • Burgerito
        </footer>
      </body>
    </html>
  );
}
