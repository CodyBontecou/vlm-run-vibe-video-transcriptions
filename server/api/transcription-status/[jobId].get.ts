export default defineEventHandler(async (event) => {
  try {
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