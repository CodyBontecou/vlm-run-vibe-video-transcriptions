import { VlmRun } from 'vlmrun'

export default defineEventHandler(async () => {
  const storage = useStorage('fs')
  
  // Get all keys that start with 'transcription:'
  const keys = await storage.getKeys('transcription:')
  
  // Fetch all local transcription data
  const localTranscriptions = await Promise.all(
    keys.map(async (key) => {
      const data = await storage.getItem<any>(key)
      const jobId = key.replace('transcription:', '')
      return {
        jobId,
        ...data
      }
    })
  )
  
  // Try to sync with vlm.run API if API key is available
  let remoteTranscriptions: any[] = []
  const apiKey = process.env.VLMRUN_API_KEY
  
  if (apiKey) {
    try {
      const client = new VlmRun({ apiKey })
      
      // Fetch recent predictions from vlm.run
      const predictions = await client.predictions.list({
        limit: 50 // Get last 50 predictions
      })
      
      // Process remote predictions and update local storage
      for (const prediction of predictions || []) {
        // Find if we have a local record with this prediction ID
        const localRecord = localTranscriptions.find(
          t => t.predictionId === prediction.id
        )
        
        if (localRecord) {
          // Update the local record with the latest status from vlm.run
          const updatedData: any = {
            ...localRecord,
            status: prediction.status,
            createdAt: localRecord.createdAt || prediction.created_at
          }
          
          // If prediction is completed and we don't have transcript yet
          if (prediction.status === 'completed' && prediction.response && !localRecord.transcript) {
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
            
            if (transcript) {
              updatedData.transcript = transcript
              updatedData.completedAt = prediction.completed_at || new Date().toISOString()
            }
          } else if (prediction.status === 'failed') {
            updatedData.status = 'error'
            updatedData.error = prediction.message || 'Transcription failed'
            updatedData.completedAt = prediction.completed_at || new Date().toISOString()
          }
          
          // Update local storage with the latest data
          await storage.setItem(`transcription:${localRecord.jobId}`, updatedData)
          
          // Update the local transcriptions array
          const index = localTranscriptions.findIndex(t => t.jobId === localRecord.jobId)
          if (index !== -1) {
            localTranscriptions[index] = { ...localTranscriptions[index], ...updatedData }
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync with vlm.run API:', error)
      // Continue with local data only
    }
  }
  
  // Sort by creation date (newest first)
  localTranscriptions.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })
  
  return localTranscriptions
})