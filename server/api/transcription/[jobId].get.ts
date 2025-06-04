import { VlmRun } from 'vlmrun'

export default defineEventHandler(async (event) => {
  try {
    // Get API key from header
    const apiKey = getHeader(event, 'x-api-key')
    if (!apiKey) {
      throw createError({
        statusCode: 401,
        statusMessage: 'API key required. Please provide your VLM Run API key.'
      })
    }
    
    const jobId = getRouterParam(event, 'jobId')
    
    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID not provided'
      })
    }

    const storage = useStorage('fs')
    const transcriptionData = await storage.getItem<any>(`transcription:${jobId}`)

    if (!transcriptionData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transcription job not found'
      })
    }

    // If we have a prediction ID, try to get full data from vlm.run
    if (transcriptionData.predictionId) {
      try {
        const client = new VlmRun({ apiKey })
        const prediction = await client.predictions.get(transcriptionData.predictionId)
        
        // Return combined data with full response from vlm.run
        return {
          ...transcriptionData,
          prediction: {
            id: prediction.id,
            status: prediction.status,
            created_at: prediction.created_at,
            completed_at: prediction.completed_at,
            response: prediction.response,
            usage: prediction.usage
          }
        }
      } catch (error) {
        console.error('Failed to fetch prediction from vlm.run:', error)
        // Continue with local data if API fails
      }
    }

    // Return local data with any stored full response
    return transcriptionData
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    
    console.error('Get transcription error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get transcription details'
    })
  }
})