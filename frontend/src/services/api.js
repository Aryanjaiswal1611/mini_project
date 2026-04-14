const BASE_URL = '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export const api = {
  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async post(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
    return handleResponse(response)
  },

  async put(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
    return handleResponse(response)
  },

  async patch(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
    return handleResponse(response)
  },

  async delete(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined
    })
    return handleResponse(response)
  }
}

// Food API
export const foodApi = {
  getAll: () => api.get('/foods'),
  getFeatured: () => api.get('/foods/featured'),
  getRecommended: () => api.get('/foods/recommended'),
  getCategories: () => api.get('/foods/categories'),
  getById: (id) => api.get(`/foods/${id}`)
}

// Order API
export const orderApi = {
  place: (orderData) => api.post('/orders/place', orderData),
  getHistory: () => api.get('/orders/history'),
  getById: (id) => api.get(`/orders/${id}`),
  rateDelivery: (id, rating) => api.post(`/orders/${id}/rate-delivery`, { rating })
}

// Payment API
export const paymentApi = {
  createOrder: (amount) => api.post('/payments/create-order', { amount }),
  verifyPayment: (data) => api.post('/payments/verify-payment', data)
}

// Feedback API
export const feedbackApi = {
  submit: (data) => api.post('/feedback/submit', data)
}

// Restaurant API
export const restaurantApi = {
  login: (email, password) => api.post('/restaurant/login', { email, password }),
  signup: (data) => api.post('/restaurant/signup', data),
  logout: () => api.post('/restaurant/logout', {}),
  checkAuth: () => api.get('/restaurant/check-auth'),
  getOrders: () => api.get('/restaurant/orders'),
  acceptOrder: (id) => api.post(`/restaurant/orders/${id}/accept`, {}),
  rejectOrder: (id) => api.post(`/restaurant/orders/${id}/reject`, {}),
  updateStatus: (id, status) => api.post(`/restaurant/orders/${id}/status`, { status }),
  assignPartner: (id, partnerId) => api.post(`/restaurant/orders/${id}/assign`, { partnerId }),
  toggleStatus: (isActive) => api.patch('/restaurant/status', { isActive }),
  getPartners: () => api.get('/restaurant/delivery-partners')
}

// Dishes API
export const dishesApi = {
  getByRestaurant: (restaurantId) => api.get(`/dishes/restaurant/${restaurantId}`),
  create: (formData) => api.post('/dishes', formData),
  update: (id, formData) => api.put(`/dishes/${id}`, formData),
  delete: (id) => api.delete(`/dishes/${id}`, {}),
  toggleAvailability: (id, availability) => api.patch(`/dishes/${id}/availability`, { availability })
}

// Delivery API
export const deliveryApi = {
  login: (email, password) => api.post('/delivery/login', { email, password }),
  signup: (data) => api.post('/delivery/signup', data),
  logout: () => api.post('/delivery/logout', {}),
  getMe: () => api.get('/delivery/me'),
  toggleStatus: (is_online) => api.post('/delivery/toggle-status', { is_online }),
  getOrders: () => api.get('/delivery/orders'),
  updateStatus: (id, status, verificationCode) => api.post(`/delivery/orders/${id}/status`, { status, verificationCode })
}

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getFoods: () => api.get('/admin/foods'),
  getOrders: () => api.get('/admin/orders'),
  getUsers: () => api.get('/admin/users'),
  assignPartner: (orderId, partnerId) => api.post(`/admin/orders/${orderId}/assign`, { partnerId }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status })
}
