export default defineEventHandler(async (event) => {
  const predictionId = getRouterParam(event, 'predictionId')
  
  if (!predictionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prediction ID is required'
    })
  }

  const body = await readBody(event)
  const { status, transcript, error, prediction } = body

  // Store the transcription data
  const storage = useStorage('fs')
  const jobId = `job_${predictionId}_${Date.now()}`
  
  await storage.setItem(`transcription:${jobId}`, {
    predictionId,
    status,
    transcript,
    error,
    prediction,
    createdAt: new Date().toISOString(),
    completedAt: status === 'completed' || status === 'error' ? new Date().toISOString() : undefined
  })

  return {
    success: true,
    jobId
  }
})