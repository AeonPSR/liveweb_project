'use client'

import { useEffect, useState } from 'react'

interface OrderStatusTrackerProps {
  orderId: string
}

const STATUS_STEPS = [
  'en préparation',
  'en cuisson',
  'prête à être livrée',
  'livrée'
]

const STATUS_EMOJIS: Record<string, string> = {
  'en préparation': '📋',
  'en cuisson': '🍔',
  'prête à être livrée': '📦',
  'livrée': '✅'
}

export function OrderStatusTracker({ orderId }: OrderStatusTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<string>('en préparation')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const eventSource = new EventSource(`/api/order-status/${orderId}`)

    eventSource.onopen = () => {
      console.log('SSE connection opened')
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('SSE event:', data)

        if (data.type === 'status_update') {
          setCurrentStatus(data.status)
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE error:', err)
      setError('Erreur de connexion')
      setIsConnected(false)
      eventSource.close()
    }

    return () => {
      console.log('Closing SSE connection')
      eventSource.close()
    }
  }, [orderId])

  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus)

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Statut de la commande</h3>
        {isConnected ? (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            En direct
          </span>
        ) : (
          <span className="text-xs text-red-400">Déconnecté</span>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4">{error}</div>
      )}

      {/* Current Status Display */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">
          {STATUS_EMOJIS[currentStatus]}
        </div>
        <div className="text-xl font-semibold text-brand-500">
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex justify-between items-center">
          {STATUS_STEPS.map((status, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={status} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    isCompleted
                      ? 'bg-brand-500 text-neutral-900'
                      : 'bg-neutral-700 text-neutral-400'
                  } ${isCurrent ? 'ring-4 ring-brand-500/30 scale-110' : ''}`}
                >
                  {isCompleted ? (
                    <span className="text-xl">{STATUS_EMOJIS[status]}</span>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div
                  className={`text-xs text-center max-w-[80px] ${
                    isCompleted ? 'text-neutral-200' : 'text-neutral-500'
                  }`}
                >
                  {status}
                </div>

                {/* Connector Line */}
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`absolute top-5 h-0.5 transition-all ${
                      index < currentStepIndex
                        ? 'bg-brand-500'
                        : 'bg-neutral-700'
                    }`}
                    style={{
                      left: `${(index / STATUS_STEPS.length) * 100 + 100 / STATUS_STEPS.length / 2}%`,
                      width: `${100 / STATUS_STEPS.length}%`
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Completion Message */}
      {currentStatus === 'livrée' && (
        <div className="mt-6 text-center bg-green-900/30 border border-green-600 text-green-400 p-4 rounded-lg">
          <p className="font-semibold">🎉 Votre commande a été livrée !</p>
          <p className="text-sm mt-1">Bon appétit !</p>
        </div>
      )}
    </div>
  )
}
