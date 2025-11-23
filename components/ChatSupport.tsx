'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
  id: number
  type: string
  content: string
  sender: string
  timestamp: string
  clientId?: number
}

export function ChatSupport() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3000/api/socket')
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      
      // Identify user immediately after connection
      const identifyMessage = {
        type: 'identify',
        userInfo: {
          email: session?.user?.email || 'anonymous@guest.com',
          name: session?.user?.name || 'Guest'
        }
      }
      console.log('Sending identify:', identifyMessage)
      ws.send(JSON.stringify(identifyMessage))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received:', data)

        if (data.type === 'connected') {
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            content: data.message,
            sender: 'System',
            timestamp: new Date().toISOString()
          }])
        } else if (data.type === 'message') {
          setMessages(prev => [...prev, data])
        }
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    wsRef.current = ws
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: inputValue,
      sender: session?.user?.email || 'Anonymous'
    }))

    setInputValue('')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-brand-500 text-neutral-900 p-4 rounded-full shadow-lg hover:bg-brand-400 transition-all z-50"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-neutral-700 bg-neutral-900 rounded-t-lg">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Support Chat</h3>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-200"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === session?.user?.email ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.type === 'system'
                      ? 'bg-neutral-700 text-neutral-300 text-sm text-center w-full'
                      : msg.sender === session?.user?.email
                      ? 'bg-brand-500 text-neutral-900'
                      : 'bg-neutral-700 text-neutral-100'
                  }`}
                >
                  {msg.type !== 'system' && msg.sender !== session?.user?.email && (
                    <div className="text-xs text-neutral-400 mb-1">{msg.sender}</div>
                  )}
                  <div>{msg.content}</div>
                  <div className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-neutral-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-neutral-700 text-neutral-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!isConnected || !inputValue.trim()}
                className="bg-brand-500 text-neutral-900 px-4 py-2 rounded-md hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
