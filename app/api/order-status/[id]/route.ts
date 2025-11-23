import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const ORDER_STATUSES = [
  { status: 'en préparation', delay: 0 },
  { status: 'en cuisson', delay: 5000 },
  { status: 'prête à être livrée', delay: 10000 },
  { status: 'livrée', delay: 15000 }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', orderId })}\n\n`)
      )

      // Send status updates with delays
      for (const { status, delay } of ORDER_STATUSES) {
        await new Promise(resolve => setTimeout(resolve, delay))
        
        const data = {
          type: 'status_update',
          orderId,
          status,
          timestamp: new Date().toISOString()
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )

        console.log(`SSE: Order ${orderId} status -> ${status}`)
      }

      // Close the stream after all statuses are sent
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
