import { useState, computed, readonly, onMounted } from '#imports'

export const useApiKey = () => {
  const apiKey = useState<string | null>('vlmRunApiKey', () => null)
  
  // Load from localStorage on client side
  onMounted(() => {
    if (process.client) {
      const stored = localStorage.getItem('vlmRunApiKey')
      if (stored) {
        apiKey.value = stored
      }
    }
  })
  
  const setApiKey = (key: string) => {
    apiKey.value = key
    if (process.client) {
      localStorage.setItem('vlmRunApiKey', key)
    }
  }
  
  const clearApiKey = () => {
    apiKey.value = null
    if (process.client) {
      localStorage.removeItem('vlmRunApiKey')
    }
  }
  
  const hasApiKey = computed(() => !!apiKey.value)
  
  return {
    apiKey: readonly(apiKey),
    setApiKey,
    clearApiKey,
    hasApiKey
  }
}