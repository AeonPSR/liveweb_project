'use client'

import Link from 'next/link';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { data: session, status } = useSession();
  const { getTotalQuantity } = useCart();
  const cartCount = getTotalQuantity();

  return (
    <header className="border-b border-neutral-800 sticky top-0 backdrop-blur bg-neutral-950/70 z-10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black text-xl tracking-wide">BURGERITO</Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/">Catalogue</Link>
            <Link href="/panier" className="relative">
              Panier
              {session && cartCount > 0 && (
                <span className="absolute -top-2 -right-6 bg-brand-500 text-neutral-900 text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            {session && (
              <Link href="/profile">Profil</Link>
            )}
            <Link href="/admin" className="text-neutral-500 hover:text-brand-400">Admin</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {status === 'loading' ? (
            <span className="opacity-60">...</span>
          ) : session ? (
            <>
              <span className="text-neutral-400">
                {session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-brand-400 hover:text-brand-300"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">
                Connexion
              </Link>
              <Link href="/auth/register" className="text-brand-400 hover:text-brand-300">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
