import Image from 'next/image';
import React from 'react';

export function Hero() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <div className="absolute inset-0">
        <Image
          src="/img/hero.png"
          alt="Burgerito Hero"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/90 via-neutral-950/30 to-neutral-900/10" />
      </div>
      <div className="relative z-10 px-8 py-14 md:py-16 max-w-3xl">
        {/* Keeping an accessible heading for SEO while hiding visual duplicate text */}
        <h1 className="sr-only">BURGERITO</h1>
        {/**
         * Original hero textual overlay disabled (image already contains text).
         * Restore by removing this comment block & the sr-only heading above.
         *
         * <p className="text-xs uppercase tracking-widest text-brand-300/80 font-semibold">Artisan & Savoureux</p>
         * <h1 className="mt-4 text-5xl md:text-7xl font-black leading-none text-brand-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
         *   BURGERITO
         * </h1>
         * <p className="mt-6 text-sm md:text-base text-neutral-200 leading-relaxed max-w-prose">
         *   Lorem ipsum dolor sit amet consectetur. Velit nisi tempus mattis sit mauris nunc adipiscing sit massa.
         *   Maecenas vel facilisis arcu tempus nunc.
         * </p>
         */}
      </div>
    </section>
  );
}
