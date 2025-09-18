import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="space-y-6 text-center py-20">
      <h1 className="text-4xl font-black">404</h1>
      <p className="text-neutral-400">La page demandée est introuvable.</p>
      <Link className="inline-block px-4 py-2 rounded bg-brand-600 hover:bg-brand-500 text-sm font-medium" href="/">Retour au catalogue</Link>
    </div>
  );
}
