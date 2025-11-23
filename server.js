const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { WebSocketServer } = require('ws')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Store active connections
const clients = new Map()
const rooms = new Map() // roomId -> Set of clientIds
const messageHistory = new Map() // roomId -> Array of messages
let messageIdCounter = 0

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/api/socket' })

  wss.on('connection', (ws, req) => {
    const clientId = Date.now() + Math.random()
    console.log(`Client connected: ${clientId}`)
    
    // Store client connection
    clients.set(clientId, { 
      ws, 
      userInfo: null,
      roomId: null,
      isAdmin: false
    })

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to chat server',
      clientId
    }))

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        console.log('Received:', message)

        const client = clients.get(clientId)
        if (!client) return

        // Store user info if provided
        if (message.type === 'identify') {
          client.userInfo = message.userInfo
          client.isAdmin = message.userInfo?.role === 'admin'
          
          if (!client.isAdmin) {
            // Regular user - create or join their personal room
            client.roomId = `user_${clientId}`
            if (!rooms.has(client.roomId)) {
              rooms.set(client.roomId, new Set([clientId]))
            }
            console.log(`Client ${clientId} identified as user:`, message.userInfo)
          } else {
            console.log(`Client ${clientId} identified as admin`)
          }
          
          // Send room list to admin
          if (client.isAdmin) {
            sendRoomListToAdmin(clientId)
          }
        }

        // Admin joins a specific room
        if (message.type === 'join_room' && client.isAdmin) {
          const roomId = message.roomId
          if (rooms.has(roomId)) {
            // Leave previous room if any
            if (client.roomId) {
              const oldRoom = rooms.get(client.roomId)
              if (oldRoom) oldRoom.delete(clientId)
            }
            
            // Join new room
            client.roomId = roomId
            rooms.get(roomId).add(clientId)
            
            // Send room history
            const history = messageHistory.get(roomId) || []
            ws.send(JSON.stringify({
              type: 'room_joined',
              roomId: roomId,
              history: history
            }))
            
            console.log(`Admin ${clientId} joined room ${roomId}, sent ${history.length} messages`)
          }
        }

        // Broadcast message to room participants only
        if (message.type === 'message') {
          const roomId = client.roomId
          
          console.log(`Message from client ${clientId}, roomId: ${roomId}, isAdmin: ${client.isAdmin}`)
          
          if (!roomId) {
            // User hasn't identified yet
            console.log('Client has no room ID - not sending message')
            return
          }

          // Ensure room exists
          if (!rooms.has(roomId)) {
            console.log(`Creating room ${roomId}`)
            rooms.set(roomId, new Set([clientId]))
          }

          const broadcastMessage = {
            id: messageIdCounter++,
            type: 'message',
            content: message.content,
            sender: message.sender || 'Anonymous',
            timestamp: new Date().toISOString(),
            clientId,
            roomId
          }

          // Store message in history
          if (!messageHistory.has(roomId)) {
            messageHistory.set(roomId, [])
          }
          messageHistory.get(roomId).push(broadcastMessage)

          console.log(`Broadcasting to room ${roomId}:`, broadcastMessage)

          // Send only to clients in the same room
          const roomClients = rooms.get(roomId)
          console.log(`Room has ${roomClients.size} clients`)
          
          roomClients.forEach((targetClientId) => {
            const targetClient = clients.get(targetClientId)
            if (targetClient && targetClient.ws.readyState === targetClient.ws.OPEN) {
              console.log(`Sending to client ${targetClientId}`)
              targetClient.ws.send(JSON.stringify(broadcastMessage))
            }
          })
          
          // Notify all admins about the new message (for room list updates)
          clients.forEach((c, cId) => {
            if (c.isAdmin && c.ws.readyState === c.ws.OPEN) {
              sendRoomListToAdmin(cId)
            }
          })
        }
      } catch (err) {
        console.error('Error processing message:', err)
      }
    })

    ws.on('close', () => {
      console.log(`Client disconnected: ${clientId}`)
      const client = clients.get(clientId)
      
      // Remove from room if in one
      if (client && client.roomId) {
        const room = rooms.get(client.roomId)
        if (room) {
          room.delete(clientId)
          // Don't delete the room - keep it for message history
        }
      }
      
      clients.delete(clientId)
      
      // Update admin room lists
      clients.forEach((c, cId) => {
        if (c.isAdmin && c.ws.readyState === c.ws.OPEN) {
          sendRoomListToAdmin(cId)
        }
      })
    })

    ws.on('error', (err) => {
      console.error(`WebSocket error for client ${clientId}:`, err)
      clients.delete(clientId)
    })
  })
  
  // Helper function to send room list to admin
  function sendRoomListToAdmin(adminClientId) {
    const adminClient = clients.get(adminClientId)
    if (!adminClient || !adminClient.isAdmin) return
    
    const roomList = []
    rooms.forEach((clientIds, roomId) => {
      // Find the user client in this room
      const userClientId = Array.from(clientIds).find(cId => {
        const c = clients.get(cId)
        return c && !c.isAdmin
      })
      
      if (userClientId) {
        const userClient = clients.get(userClientId)
        roomList.push({
          roomId,
          userEmail: userClient?.userInfo?.email || 'Anonymous',
          userName: userClient?.userInfo?.name || 'Guest',
          isOnline: !!userClient,
          clientId: userClientId
        })
      }
    })
    
    adminClient.ws.send(JSON.stringify({
      type: 'room_list',
      rooms: roomList
    }))
  }

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket server ready on ws://${hostname}:${port}/api/socket`)
  })
})
