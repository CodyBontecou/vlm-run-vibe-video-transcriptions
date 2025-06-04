export default defineEventHandler(async (event) => {
  try {
    // Get the job ID from query params
    const query = getQuery(event)
    const jobId = query.jobId as string

    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID not provided'
      })
    }

    // Get the transcription result from the request body
    const body = await readBody(event)
    
    console.log('Received callback for job:', jobId)
    console.log('Callback body:', JSON.stringify(body, null, 2))

    // Store the transcription result
    const storage = useStorage('fs')
    
    // Check if this is a successful transcription
    if (body.status === 'completed' && body.response) {
      // Extract transcript from the response
      let transcript = ''
      
      if (body.response.segments && Array.isArray(body.response.segments)) {
        transcript = body.response.segments
          .map((segment: any) => segment.audio?.content || '')
          .filter((text: string) => text.length > 0)
          .join(' ')
      } else if (typeof body.response === 'string') {
        transcript = body.response
      }

      await storage.setItem(`transcription:${jobId}`, {
        status: 'completed',
        transcript,
        completedAt: new Date().toISOString(),
        fullResponse: body
      })

      console.log(`Transcription completed for job ${jobId}`)
    } else if (body.status === 'failed' || body.status === 'error') {
      // Handle error case
      await storage.setItem(`transcription:${jobId}`, {
        status: 'error',
        error: body.message || 'Transcription failed',
        completedAt: new Date().toISOString(),
        fullResponse: body
      })

      console.error(`Transcription failed for job ${jobId}:`, body.message)
    } else {
      // Handle other statuses
      await storage.setItem(`transcription:${jobId}`, {
        status: body.status || 'unknown',
        completedAt: new Date().toISOString(),
        fullResponse: body
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Callback error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process transcription callback'
    })
  }
})