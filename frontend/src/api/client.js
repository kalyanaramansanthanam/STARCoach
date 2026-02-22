import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export async function fetchQuestions() {
  const { data } = await api.get('/questions')
  return data
}

export async function uploadRecording(formData) {
  const { data } = await api.post('/recordings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function triggerAnalysis(attemptId) {
  const { data } = await api.post(`/analyze/${attemptId}`)
  return data
}

export async function getAnalysisStatus(attemptId) {
  const { data } = await api.get(`/analyze/${attemptId}/status`)
  return data
}

export async function getAttempts(questionId) {
  const { data } = await api.get(`/attempts/${questionId}`)
  return data
}

export async function getProgress(questionId) {
  const { data } = await api.get(`/attempts/${questionId}/progress`)
  return data
}

export default api
