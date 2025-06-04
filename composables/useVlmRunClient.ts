export const useVlmRunClient = () => {
  const { apiKey } = useApiKey()
  const baseURL = 'https://api.vlm.run/v1'

  const uploadFile = async (file: File) => {
    if (!apiKey.value) {
      throw new Error('API key is required')
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await $fetch(`${baseURL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
        },
        body: formData,
      })

      return response
    } catch (error: any) {
      console.error('File upload error:', error)
      
      // Check for CORS error
      if (error.status === 0 || error.message?.includes('CORS') || error.message?.includes('blocked')) {
        throw new Error('Direct upload failed due to CORS restrictions. Please use the server-side upload option.')
      }
      
      throw error
    }
  }

  const transcribeVideo = async (fileId: string, callbackUrl?: string) => {
    if (!apiKey.value) {
      throw new Error('API key is required')
    }

    const body = {
      file_id: fileId,  // Changed from fileId to file_id
      domain: 'video.transcription',
      batch: true,
      ...(callbackUrl && { callbackUrl })
    }

    try {
      const response = await $fetch(`${baseURL}/video/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      return response
    } catch (error) {
      console.error('Transcription error:', error)
      throw error
    }
  }

  const checkPredictionStatus = async (predictionId: string) => {
    if (!apiKey.value) {
      throw new Error('API key is required')
    }

    try {
      const response = await $fetch(`${baseURL}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
        },
      })

      return response
    } catch (error) {
      console.error('Status check error:', error)
      throw error
    }
  }

  return {
    uploadFile,
    transcribeVideo,
    checkPredictionStatus,
  }
}