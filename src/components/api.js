const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Request failed')
  }
  return data
}

export const api = {
  baseUrl: BASE_URL,
  // Auth
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  // Profile
  getProfile: (userId) => request(`/users/${userId}`),
  updateProfile: (userId, payload) => request(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Items
  createItem: (payload) => request('/items', { method: 'POST', body: JSON.stringify(payload) }),
  searchItems: (filters) => request('/items/search', { method: 'POST', body: JSON.stringify(filters) }),
  nearbyItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/nearby/items${qs ? `?${qs}` : ''}`)
  },

  // Offers
  createOffer: (payload) => request('/offers', { method: 'POST', body: JSON.stringify(payload) }),
  listOffersForUser: (userId) => request(`/offers/for-user/${userId}`),
  actOnOffer: (offerId, action) => request(`/offers/${offerId}/action`, { method: 'POST', body: JSON.stringify({ action }) }),

  // Ratings
  createRating: (payload) => request('/ratings', { method: 'POST', body: JSON.stringify(payload) }),

  // System
  health: () => request('/'),
}
