'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getOrderDetail } from '../../../lib/api'
import { OrderDetail } from '../../../types/order'

interface OrderPageProps {
  params: { id: string }
}

export default function OrderPage({ params }: OrderPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/orders/' + params.id)
      return
    }

    if (status === 'authenticated' && session?.accessToken) {
      loadOrderDetail()
    }
  }, [status, session, params.id, router])

  const loadOrderDetail = async () => {
    if (!session?.accessToken) return
    
    try {
      setLoading(true)
      const response = await getOrderDetail(params.id, session.accessToken)
      console.log('Raw API response:', response)
      
      if (!response) {
        setError('Commande introuvable')
      } else {
        // Transform the API response to match our expected format
        const transformedData = {
          order: response.order,
          items: response.items?.map((item: any) => ({
            ...item.product,
            priceAtPurchase: item.priceAtPurchase,
            quantity: 1 // Each item in the array represents 1 quantity
          })) || []
        }
        
        console.log('Transformed data:', transformedData)
        setOrderDetail(transformedData)
      }
    } catch (err) {
      setError('Erreur lors du chargement de la commande')
      console.error('Failed to load order detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status?: string) => {
    const statusClasses = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
      confirmed: 'bg-blue-900/30 text-blue-400 border-blue-600',
      delivered: 'bg-green-900/30 text-green-400 border-green-600',
      cancelled: 'bg-red-900/30 text-red-400 border-red-600'
    }
    
    const statusLabels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    }
    
    const className = statusClasses[status as keyof typeof statusClasses] || statusClasses.pending
    const label = statusLabels[status as keyof typeof statusLabels] || 'En attente'
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded border ${className}`}>
        {label}
      </span>
    )
  }

  const calculateItemTotal = () => {
    if (!orderDetail?.items) return 0
    return orderDetail.items.reduce((total, item: any) => {
      return total + (item.priceAtPurchase || item.price || 0)
    }, 0)
  }

  const getItemQuantity = (productId: string) => {
    if (!orderDetail?.items) return 0
    // Count how many times this product appears in the items array
    return orderDetail.items.filter((item: any) => item.id === productId).length
  }

  // Group items by product ID and calculate quantities
  const getGroupedProducts = () => {
    if (!orderDetail?.items) return []
    
    const grouped = (orderDetail.items as any[]).reduce((acc: any[], item: any) => {
      const existingProduct = acc.find((p: any) => p.id === item.id)
      if (existingProduct) {
        existingProduct.quantity += 1
        existingProduct.totalPrice += (item.priceAtPurchase || item.price || 0)
      } else {
        acc.push({
          ...item,
          quantity: 1,
          totalPrice: item.priceAtPurchase || item.price || 0
        })
      }
      return acc
    }, [] as any[])
    
    return grouped
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  if (error || !orderDetail) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Commande introuvable</h1>
        <p className="text-neutral-400 mb-8">{error || 'Cette commande n\'existe pas ou vous n\'y avez pas accès.'}</p>
        <Link 
          href="/profile" 
          className="inline-block bg-brand-500 text-neutral-900 font-medium py-2 px-6 rounded-md hover:bg-brand-400 transition-colors"
        >
          Retour au profil
        </Link>
      </div>
    )
  }

  // Get unique products with their quantities
  const groupedProducts = getGroupedProducts()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/profile" 
          className="text-brand-400 hover:text-brand-300 text-sm font-medium mb-4 inline-block"
        >
          ← Retour au profil
        </Link>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Commande #{orderDetail.order.id.slice(-8)}</h1>
            <p className="text-neutral-400">{formatDate(orderDetail.order.createdAt)}</p>
          </div>
          {getStatusBadge(orderDetail.order.status)}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Articles commandés</h2>
          <div className="space-y-4">
            {groupedProducts.length > 0 ? (
              // Display full product details
              groupedProducts.map((item: any) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name || 'Produit'}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name || 'Produit sans nom'}</h3>
                    <p className="text-neutral-400 text-sm">
                      {(item.priceAtPurchase || item.price || 0).toFixed(2)} € × {item.quantity}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{item.totalPrice.toFixed(2)} €</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-400">Aucun article trouvé dans cette commande.</p>
            )}
          </div>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-bold text-brand-400">
              {orderDetail.order.total?.toFixed(2) || calculateItemTotal().toFixed(2)} €
            </span>
          </div>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Informations de livraison</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-400">Statut :</span> {getStatusBadge(orderDetail.order.status)}</p>
            <p><span className="text-neutral-400">Commande passée le :</span> {formatDate(orderDetail.order.createdAt)}</p>
            {orderDetail.order.updatedAt && orderDetail.order.updatedAt !== orderDetail.order.createdAt && (
              <p><span className="text-neutral-400">Dernière mise à jour :</span> {formatDate(orderDetail.order.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}