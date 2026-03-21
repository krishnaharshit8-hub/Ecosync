import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.message)
    return Promise.reject(error)
  }
)

// API functions
export const api = {
  getHouses: () => apiClient.get('/api/houses'),
  getEnergyCurrent: () => apiClient.get('/api/energy/current'),
  getEnergyHistory: (houseId?: string, limit = 100) =>
    apiClient.get('/api/energy/history', { params: { house_id: houseId, limit } }),
  getTradesHistory: () => apiClient.get('/api/trades/history'),
  executeTrade: (seller: string, buyer: string, amount: number) =>
    apiClient.post('/api/trades/execute', { seller, buyer, amount }),
  getPrediction: (houseId: string) =>
    apiClient.get(`/api/predictions/${houseId}`),
  getAllPredictions: () => apiClient.get('/api/predictions/all'),
  getAgentsStatus: () => apiClient.get('/api/agents/status'),
  injectSimulation: (data: object) =>
    apiClient.post('/api/simulation/inject', data),
}
