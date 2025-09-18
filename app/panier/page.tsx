'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../contexts/CartContext'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/panier')
      return
    }

    if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-neutral-400 mb-8">Découvrez nos délicieux burgers !</p>
        <Link 
          href="/" 
          className="inline-block bg-brand-500 text-neutral-900 font-medium py-2 px-6 rounded-md hover:bg-brand-400 transition-colors"
        >
          Voir le catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mon Panier</h1>
        <button
          onClick={clearCart}
          className="text-red-400 hover:text-red-300 text-sm font-medium"
        >
          Vider le panier
        </button>
      </div>
      
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex gap-4 bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
            <div className="relative w-24 h-24 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
              {item.product.imageUrl && (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.product.name}</h3>
              <p className="text-neutral-400 text-sm mt-1">{item.product.price.toFixed(2)} €</p>
              <p className="text-neutral-300 text-sm mt-2 line-clamp-2">{item.product.description}</p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium transition-colors"
                >
                  -
                </button>
                <span className="min-w-[2rem] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium transition-colors"
                >
                  +
                </button>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} €</p>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-400 hover:text-red-300 text-sm mt-1"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-bold text-brand-400">{getTotalPrice().toFixed(2)} €</span>
        </div>
        
        <button className="w-full bg-brand-500 text-neutral-900 font-medium py-3 px-6 rounded-md hover:bg-brand-400 transition-colors">
          Procéder au paiement
        </button>
      </div>
    </div>
  )
}