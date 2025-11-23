let ws = null
let isConnected = false
let messages = []
let rooms = []
let currentRoomId = null

const statusDot = document.getElementById('statusDot')
const statusText = document.getElementById('statusText')
const clientsList = document.getElementById('clientsList')
const messagesContainer = document.getElementById('messagesContainer')
const messageForm = document.getElementById('messageForm')
const messageInput = document.getElementById('messageInput')
const sendBtn = document.getElementById('sendBtn')
const chatHeader = document.getElementById('chatHeader')
const stats = document.getElementById('stats')

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3000/api/socket')
  
  ws.onopen = () => {
    console.log('WebSocket connected')
    isConnected = true
    updateStatus(true)
    
    // Identify as admin
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
      console.log('Received:', data)
      
      if (data.type === 'connected') {
        addMessage({
          id: Date.now(),
          type: 'system',
          content: data.message,
          sender: 'System',
          timestamp: new Date().toISOString()
        })
      } else if (data.type === 'room_list') {
        rooms = data.rooms
        updateRoomsList()
      } else if (data.type === 'room_joined') {
        currentRoomId = data.roomId
        // Load history if provided
        if (data.history && data.history.length > 0) {
          data.history.forEach(msg => {
            if (!messages.find(m => m.id === msg.id)) {
              messages.push(msg)
            }
          })
        }
        renderMessages()
        updateChatHeader()
      } else if (data.type === 'message') {
        // Store all messages regardless of current room
        addMessage(data)
      }
    } catch (err) {
      console.error('Error parsing message:', err)
    }
  }
  
  ws.onclose = () => {
    console.log('WebSocket disconnected')
    isConnected = false
    updateStatus(false)
    
    // Attempt to reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    isConnected = false
    updateStatus(false)
  }
}

function updateStatus(connected) {
  if (connected) {
    statusDot.classList.add('connected')
    statusText.textContent = 'Connected'
    messageInput.disabled = false
    sendBtn.disabled = false
  } else {
    statusDot.classList.remove('connected')
    statusText.textContent = 'Disconnected'
    messageInput.disabled = true
    sendBtn.disabled = true
  }
}

function updateRoomsList() {
  stats.textContent = `${rooms.length} active chat${rooms.length !== 1 ? 's' : ''}`
  
  if (rooms.length === 0) {
    clientsList.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">No active chats</div>'
    return
  }
  
  clientsList.innerHTML = rooms.map(room => `
    <div class="client-item ${currentRoomId === room.roomId ? 'active' : ''}" 
         onclick="joinRoom('${room.roomId}')"
         data-room-id="${room.roomId}">
      <div class="client-email">${room.userEmail}</div>
      <div class="client-status">${room.isOnline ? 'Online' : 'Offline'}</div>
    </div>
  `).join('')
}

function joinRoom(roomId) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  
  currentRoomId = roomId
  
  ws.send(JSON.stringify({
    type: 'join_room',
    roomId: roomId
  }))
  
  updateRoomsList()
  renderMessages()
  updateChatHeader()
}

function renderMessages() {
  messagesContainer.innerHTML = ''
  
  // Filter messages for current room
  const roomMessages = messages.filter(msg => 
    msg.type === 'system' || msg.roomId === currentRoomId
  )
  
  roomMessages.forEach(msg => {
    const isOwn = msg.sender === 'Support Admin'
    const isSystem = msg.type === 'system'
    
    const messageDiv = document.createElement('div')
    
    if (isSystem) {
      messageDiv.className = 'message'
      messageDiv.innerHTML = `
        <div class="message-content message-system">${msg.content}</div>
      `
    } else {
      messageDiv.className = `message ${isOwn ? 'own' : ''}`
      messageDiv.innerHTML = `
        ${!isOwn ? `<div class="message-sender">${msg.sender}</div>` : ''}
        <div class="message-content">${msg.content}</div>
        <div class="message-time">${formatTime(msg.timestamp)}</div>
      `
    }
    
    messagesContainer.appendChild(messageDiv)
  })
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function updateChatHeader() {
  const room = rooms.find(r => r.roomId === currentRoomId)
  if (room) {
    chatHeader.innerHTML = `
      <div style="font-weight: 600;">Chat with ${room.userEmail}</div>
      <div style="font-size: 0.875rem; color: #999; margin-top: 0.25rem;">
        ${room.isOnline ? '🟢 Online' : '⚫ Offline'}
      </div>
    `
  } else {
    chatHeader.innerHTML = '<div class="empty-state">Select a chat to start messaging</div>'
  }
}

function addMessage(msg) {
  messages.push(msg)
  
  // Only render if it's for the current room or it's a system message
  if (msg.type === 'system' || msg.roomId === currentRoomId) {
    const isOwn = msg.sender === 'Support Admin'
    const isSystem = msg.type === 'system'
    
    const messageDiv = document.createElement('div')
    
    if (isSystem) {
      messageDiv.className = 'message'
      messageDiv.innerHTML = `
        <div class="message-content message-system">${msg.content}</div>
      `
    } else {
      messageDiv.className = `message ${isOwn ? 'own' : ''}`
      messageDiv.innerHTML = `
        ${!isOwn ? `<div class="message-sender">${msg.sender}</div>` : ''}
        <div class="message-content">${msg.content}</div>
        <div class="message-time">${formatTime(msg.timestamp)}</div>
      `
    }
    
    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}

function sendMessage(e) {
  e.preventDefault()
  
  const content = messageInput.value.trim()
  if (!content || !ws || ws.readyState !== WebSocket.OPEN || !currentRoomId) {
    return
  }
  
  ws.send(JSON.stringify({
    type: 'message',
    content: content,
    sender: 'Support Admin'
  }))
  
  messageInput.value = ''
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Event listeners
messageForm.addEventListener('submit', sendMessage)

// Make joinRoom global for onclick handler
window.joinRoom = joinRoom

// Initialize
connectWebSocket()
updateRoomsList()
