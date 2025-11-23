'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: number
  type: string
  content: string
  sender: string
  timestamp: string
  clientId?: number
  roomId?: string
}

interface Room {
  roomId: string
  userEmail: string
  userName: string
  isOnline: boolean
  clientId: number
}

export default function AdminPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentRoomId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3000/api/socket')
    
    ws.onopen = () => {
      console.log('Admin WebSocket connected')
      setIsConnected(true)
      
      ws.send(JSON.stringify({
        type: 'identify',
        userInfo: {
          role: 'admin',
          name: 'Support Admin'
        }
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Admin received:', data)

        if (data.type === 'connected') {
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            content: data.message,
            sender: 'System',
            timestamp: new Date().toISOString()
          }])
        } else if (data.type === 'room_list') {
          setRooms(data.rooms)
        } else if (data.type === 'room_joined') {
          setCurrentRoomId(data.roomId)
          if (data.history && data.history.length > 0) {
            data.history.forEach((msg: Message) => {
              if (!messages.find(m => m.id === msg.id)) {
                setMessages(prev => [...prev, msg])
              }
            })
          }
        } else if (data.type === 'message') {
          setMessages(prev => [...prev, data])
        }
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }

    ws.onclose = () => {
      console.log('Admin WebSocket disconnected')
      setIsConnected(false)
      setTimeout(connectWebSocket, 3000)
    }

    ws.onerror = (error) => {
      console.error('Admin WebSocket error:', error)
      setIsConnected(false)
    }

    wsRef.current = ws
  }

  const joinRoom = (roomId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    
    setCurrentRoomId(roomId)
    
    wsRef.current.send(JSON.stringify({
      type: 'join_room',
      roomId: roomId
    }))
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !currentRoomId) {
      return
    }

    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: inputValue,
      sender: 'Support Admin'
    }))

    setInputValue('')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentRoom = rooms.find(r => r.roomId === currentRoomId)
  const roomMessages = messages.filter(msg => 
    msg.type === 'system' || msg.roomId === currentRoomId
  )

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Sidebar */}
      <div className="w-80 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="font-semibold">Support Admin</h2>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-neutral-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="p-3 border-b border-neutral-800 bg-neutral-900/50">
          <div className="text-sm text-neutral-400">
            {rooms.length} active chat{rooms.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">No active chats</div>
          ) : (
            rooms.map(room => (
              <div
                key={room.roomId}
                onClick={() => joinRoom(room.roomId)}
                className={`p-4 border-b border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors ${
                  currentRoomId === room.roomId ? 'bg-neutral-800 border-l-4 border-l-brand-500' : ''
                }`}
              >
                <div className="font-medium text-sm">{room.userEmail}</div>
                <div className="text-xs text-neutral-400 mt-1">
                  {room.isOnline ? '🟢 Online' : '⚫ Offline'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          {currentRoom ? (
            <>
              <div className="font-semibold">Chat with {currentRoom.userEmail}</div>
              <div className="text-sm text-neutral-400 mt-1">
                {currentRoom.isOnline ? '🟢 Online' : '⚫ Offline'}
              </div>
            </>
          ) : (
            <div className="text-neutral-500">Select a chat to start messaging</div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {roomMessages.map((msg) => {
            const isOwn = msg.sender === 'Support Admin'
            const isSystem = msg.type === 'system'

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {isSystem ? (
                  <div className="bg-neutral-800 text-neutral-400 text-sm px-3 py-2 rounded-full">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex flex-col max-w-[70%]">
                    {!isOwn && (
                      <div className="text-xs text-neutral-500 mb-1">{msg.sender}</div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwn
                          ? 'bg-brand-500 text-neutral-900'
                          : 'bg-neutral-800 text-neutral-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-neutral-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-neutral-800 text-neutral-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              disabled={!isConnected || !currentRoomId}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputValue.trim() || !currentRoomId}
              className="bg-brand-500 text-neutral-900 px-4 py-2 rounded-md hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
