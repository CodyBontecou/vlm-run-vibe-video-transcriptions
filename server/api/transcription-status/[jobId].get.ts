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

    // POLLING LOGIC COMMENTED OUT FOR CALLBACK TESTING
    // Uncomment this block to enable polling as a fallback mechanism
    /*
    // If we have a prediction ID and status is not completed/error, poll vlm.run API
    if (transcriptionData.predictionId && 
        transcriptionData.status !== 'completed' && 
        transcriptionData.status !== 'error') {
      
      const apiKey = process.env.VLMRUN_API_KEY
      if (!apiKey) {
        throw createError({
          statusCode: 500,
          statusMessage: 'VLM Run API key not configured'
        })
      }

      try {
        const client = new VlmRun({ apiKey })
        const prediction = await client.predictions.get(transcriptionData.predictionId)
        
        console.log(`Polling prediction ${transcriptionData.predictionId}, status: ${prediction.status}`)
        
        // Update local storage based on prediction status
        if (prediction.status === 'completed' && prediction.response) {
          let transcript = ''
          
          // Extract transcript from the response
          if (prediction.response.segments && Array.isArray(prediction.response.segments)) {
            transcript = prediction.response.segments
              .map((segment: any) => segment.audio?.content || '')
              .filter((text: string) => text.length > 0)
              .join(' ')
          } else if (typeof prediction.response === 'string') {
            transcript = prediction.response
          }
          
          const updatedData = {
            ...transcriptionData,
            status: 'completed',
            transcript,
            completedAt: prediction.completed_at || new Date().toISOString(),
            fullResponse: prediction.response
          }
          
          await storage.setItem(`transcription:${jobId}`, updatedData)
          return updatedData
          
        } else if (prediction.status === 'failed') {
          const updatedData = {
            ...transcriptionData,
            status: 'error',
            error: prediction.message || 'Transcription failed',
            completedAt: prediction.completed_at || new Date().toISOString()
          }
          
          await storage.setItem(`transcription:${jobId}`, updatedData)
          return updatedData
          
        } else {
          // Update status if changed
          if (transcriptionData.status !== prediction.status) {
            await storage.setItem(`transcription:${jobId}`, {
              ...transcriptionData,
              status: prediction.status
            })
          }
          
          return {
            ...transcriptionData,
            status: prediction.status
          }
        }
      } catch (vlmError: any) {
        console.error('Failed to poll vlm.run API:', vlmError)
        // Continue with local data
      }
    }
    */

    // If status is error, include the error message
    if (transcriptionData.status === 'error') {
      return {
        status: 'error',
        error: transcriptionData.error || 'Unknown error occurred',
        completedAt: transcriptionData.completedAt
      }
    }

    return transcriptionData
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    
    console.error('Status check error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check transcription status'
    })
  }
})