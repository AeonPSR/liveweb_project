import Link from 'next/link';
import React from 'react';

export function Header() {
  return (
    <header className="border-b border-neutral-800 sticky top-0 backdrop-blur bg-neutral-950/70 z-10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-8">
        <Link href="/" className="font-black text-xl tracking-wide">BURGERITO</Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/">Catalogue</Link>
          <Link href="/cart" className="opacity-60 pointer-events-none" aria-disabled="true">Panier (à venir)</Link>
        </nav>
      </div>
    </header>
  );
}
