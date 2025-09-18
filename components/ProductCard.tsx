'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types/product';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const unavailable = product.isAvailable === false;
  const { data: session } = useSession();
  const router = useRouter();

  const addToCart = () => {
    if (!session) {
      router.push('/auth/login?callbackUrl=/');
      return;
    }

    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex((item: any) => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      currentCart.push({ product, quantity: 1 });
    }
    
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Optional: Show some feedback (you could add a toast notification here)
    console.log('Product added to cart:', product.name);
  };

  return (
    <div className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-brand-500 transition-colors overflow-hidden">
      <Link href={`/product/${product.id}`} className="relative aspect-video bg-neutral-800 block">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        )}
        {unavailable && (
          <span className="absolute top-2 left-2 rounded bg-red-600 text-[10px] font-semibold uppercase tracking-wide px-2 py-1">
            Indisponible
          </span>
        )}
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="space-y-1">
          <h3 className="font-semibold leading-tight line-clamp-2 min-h-[2.75rem] text-sm">{product.name}</h3>
          <p className="text-[13px] text-neutral-400 font-medium">{product.price.toFixed(2)} €</p>
        </div>
        <div className="mt-auto flex gap-2 items-center">
          <button
            disabled={unavailable}
            onClick={addToCart}
            className="text-xs font-medium rounded-md px-3 py-2 bg-brand-500 text-neutral-900 hover:bg-brand-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
            aria-label={unavailable ? 'Produit indisponible' : 'Ajouter au panier'}
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
