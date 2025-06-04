import { VlmRun } from 'vlmrun'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export default defineEventHandler(async (event) => {
  let tempFilePath: string | null = null
  
  try {
    // Get API key from header
    const apiKey = getHeader(event, 'x-api-key')
    if (!apiKey) {
      throw createError({
        statusCode: 401,
        statusMessage: 'API key required. Please provide your VLM Run API key.'
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

    // Check file size (4.5MB limit for Vercel Hobby, 100MB for Pro)
    const maxSize = 4.5 * 1024 * 1024 // 4.5MB for Vercel Hobby
    if (videoFile.data.length > maxSize) {
      throw createError({
        statusCode: 413,
        statusMessage: `Video file too large. Maximum size is 4.5MB on Vercel Hobby plan (100MB on Pro), your file is ${Math.round(videoFile.data.length / 1024 / 1024)}MB`
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

      // Get the base URL for the callback
      let callbackUrl: string | undefined
      
      // Check if we have a custom callback URL (e.g., from ngrok)
      if (process.env.CALLBACK_BASE_URL) {
        callbackUrl = `${process.env.CALLBACK_BASE_URL}/api/transcription-callback?jobId=${jobId}`
        console.log('Using custom callback URL:', callbackUrl)
      } else {
        // Fall back to constructing from request if no custom URL provided
        const host = getRequestHost(event)
        const protocol = getRequestProtocol(event)
        callbackUrl = `${protocol}://${host}/api/transcription-callback?jobId=${jobId}`
        console.log('Using request-based callback URL:', callbackUrl)
      }

      // Submit the video for transcription
      const prediction = await client.video.generate({
        fileId: uploadedFile.id,
        domain: 'video.transcription',
        batch: true,
        callbackUrl
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