'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUserOrders } from '../../lib/api'
import { Order } from '../../types/order'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile')
      return
    }

    if (status === 'authenticated' && session?.accessToken) {
      loadOrders()
    }
  }, [status, session, router])

  const loadOrders = async () => {
    if (!session?.accessToken) return
    
    try {
      setLoading(true)
      const userOrders = await getUserOrders(session.accessToken)
      setOrders(userOrders)
    } catch (err) {
      setError('Erreur lors du chargement des commandes')
      console.error('Failed to load orders:', err)
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
      <span className={`px-2 py-1 text-xs font-medium rounded border ${className}`}>
        {label}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Mon Profil</h1>
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
          <div className="space-y-2">
            <p><span className="text-neutral-400">Email :</span> {session?.user?.email}</p>
            <p><span className="text-neutral-400">Membre depuis :</span> {session?.user?.name || 'Non renseigné'}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Historique des commandes</h2>
          <button
            onClick={loadOrders}
            className="text-brand-400 hover:text-brand-300 text-sm font-medium"
          >
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
            <p className="text-neutral-400 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
            <Link 
              href="/" 
              className="inline-block bg-brand-500 text-neutral-900 font-medium py-2 px-6 rounded-md hover:bg-brand-400 transition-colors"
            >
              Découvrir nos burgers
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Commande #{order.id.slice(-8)}</h3>
                    <p className="text-neutral-400 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-brand-400 hover:text-brand-300 text-sm font-medium"
                    >
                      Voir détails →
                    </Link>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-neutral-400">
                      {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                  {order.total && (
                    <p className="font-semibold text-brand-400">
                      {order.total.toFixed(2)} €
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}