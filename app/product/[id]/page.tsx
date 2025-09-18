import { getProduct } from '../../../lib/api';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface ProductPageProps { params: { id: string } }

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) return { title: 'Produit introuvable • Burgerito' };
  return { title: `${product.name} • Burgerito` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) return notFound();
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden">
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        )}
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-brand-400 font-mono text-lg">{product.price.toFixed(2)} €</p>
        </div>
        <p className="text-sm leading-relaxed text-neutral-300 whitespace-pre-line">
          {product.description}
        </p>
      </div>
    </div>
  );
}
