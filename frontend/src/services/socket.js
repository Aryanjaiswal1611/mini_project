import { io } from 'socket.io-client'

let socket = null

function initSocket() {
  if (!socket) {
    socket = io({
      autoConnect: false
    })
  }
  return socket
}

export function connectSocket() {
  const s = initSocket()
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
  }
}

export function getSocket() {
  return socket
}

// Restaurant room
export function joinRestaurantRoom(restaurantId) {
  const s = connectSocket()
  s.emit('join_restaurant_room', restaurantId)
}

export function leaveRestaurantRoom(restaurantId) {
  socket?.emit('leave_restaurant_room', restaurantId)
}

// Order tracking room
export function joinOrderRoom(orderId) {
  const s = connectSocket()
  s.emit('join_order_room', orderId)
}

export function leaveOrderRoom(orderId) {
  socket?.emit('leave_order_room', orderId)
}

// Delivery location update
export function sendLocationUpdate(orderId, lat, lng) {
  socket?.emit('delivery_location_update', { orderId, lat, lng })
}

// Event listeners
export function onNewOrder(callback) {
  socket?.on('new_order', callback)
}

export function offNewOrder(callback) {
  socket?.off('new_order', callback)
}

export function onStatusUpdate(callback) {
  socket?.on('status_update', callback)
}

export function offStatusUpdate(callback) {
  socket?.off('status_update', callback)
}

export function onLocationUpdate(callback) {
  socket?.on('location_update', callback)
}

export function offLocationUpdate(callback) {
  socket?.off('location_update', callback)
}

export function onConnect(callback) {
  socket?.on('connect', callback)
}

export function offConnect(callback) {
  socket?.off('connect', callback)
}

export function onDisconnect(callback) {
  socket?.on('disconnect', callback)
}

export function offDisconnect(callback) {
  socket?.off('disconnect', callback)
}

const socketService = {
  initSocket,
  connectSocket,
  disconnectSocket,
  getSocket,
  joinRestaurantRoom,
  leaveRestaurantRoom,
  joinOrderRoom,
  leaveOrderRoom,
  sendLocationUpdate,
  onNewOrder,
  offNewOrder,
  onStatusUpdate,
  offStatusUpdate,
  onLocationUpdate,
  offLocationUpdate,
  onConnect,
  offConnect,
  onDisconnect,
  offDisconnect
}

export default socketService
