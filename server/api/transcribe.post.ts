import { VlmRun } from 'vlmrun'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export default defineEventHandler(async (event) => {
  let tempFilePath: string | null = null
  
  try {
    // Check for API key first
    const apiKey = process.env.VLMRUN_API_KEY
    if (!apiKey) {
      console.error('VLMRUN_API_KEY environment variable is not set')
      throw createError({
        statusCode: 500,
        statusMessage: 'VLM Run API key not configured. Please set VLMRUN_API_KEY in your .env file'
      })
    }

    // Parse multipart form data using Nuxt's built-in method
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No form data provided'
      })
    }

    // Find the video file in the form data
    const videoFile = formData.find(item => item.name === 'video')
    
    if (!videoFile || !videoFile.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No video file provided'
      })
    }

    // Initialize VLM Run client
    const client = new VlmRun({ apiKey })

    // Create a unique job ID for tracking
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Store the job ID in file-based storage for persistence
    const storage = useStorage('fs')
    await storage.setItem(`transcription:${jobId}`, {
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    // Save the video to a temporary file
    const filename = videoFile.filename || 'video.mp4'
    tempFilePath = join(tmpdir(), `${jobId}_${filename}`)
    await writeFile(tempFilePath, videoFile.data)

    console.log('Uploading video file:', {
      filename,
      size: videoFile.data.length,
      tempPath: tempFilePath
    })

    try {
      // First, upload the video file
      const uploadedFile = await client.files.upload({
        filePath: tempFilePath,
        checkDuplicate: false
      })
      
      console.log('File uploaded successfully:', uploadedFile.id)

      // Submit the video for transcription
      const prediction = await client.video.generate({
        fileId: uploadedFile.id,
        domain: 'video.transcription',
        batch: true
      })
      
      console.log('Transcription job started:', prediction.id)

      // Store the prediction ID for tracking
      await storage.setItem(`transcription:${jobId}`, {
        status: 'processing',
        predictionId: prediction.id,
        createdAt: new Date().toISOString()
      })

      // Clean up the temporary file
      if (tempFilePath) {
        await unlink(tempFilePath).catch(err => 
          console.error('Failed to delete temp file:', err)
        )
      }

      return {
        jobId,
        status: 'processing',
        message: 'Video submitted for transcription',
        predictionId: prediction.id
      }
    } catch (vlmError: any) {
      console.error('VLM Run API error:', vlmError)
      console.error('Error details:', vlmError.response?.data || vlmError.message)
      
      // Store error status
      await storage.setItem(`transcription:${jobId}`, {
        status: 'error',
        error: vlmError.message || 'Unknown error',
        completedAt: new Date().toISOString()
      })
      
      throw createError({
        statusCode: 500,
        statusMessage: `VLM Run API error: ${vlmError.message || 'Unknown error'}`
      })
    }
  } catch (error: any) {
    console.error('Transcription endpoint error:', error)
    
    // Clean up temp file if it exists
    if (tempFilePath) {
      await unlink(tempFilePath).catch(err => 
        console.error('Failed to delete temp file:', err)
      )
    }
    
    // If it's already a Nuxt error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process video transcription'
    })
  }
})