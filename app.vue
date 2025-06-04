<template>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto p-4 sm:p-6">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Video Transcription
            </h1>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Video Upload Column -->
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            @drop="handleDrop"
                            @dragover.prevent
                            @dragenter.prevent="isDragging = true"
                            @dragleave.prevent="isDragging = false"
                            @click="openFileDialog"
                            class="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                            :class="{
                                'border-blue-500 bg-blue-50': isDragging,
                            }"
                        >
                            <input
                                ref="fileInput"
                                type="file"
                                accept="video/*"
                                @change="handleFileSelect"
                                class="hidden"
                            />
                            <div v-if="!videoFile" class="space-y-4">
                                <svg
                                    class="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                                <p class="text-sm sm:text-base text-gray-600">
                                    Drag and drop your video file here
                                </p>
                                <p class="text-xs sm:text-sm text-gray-500">
                                    or click to browse
                                </p>
                                <p class="text-xs sm:text-sm text-gray-500">
                                    Supported formats: MP4, MOV, AVI, WebM
                                </p>
                            </div>

                            <div v-else class="space-y-4">
                                <p class="text-sm sm:text-base text-gray-700 font-medium break-all">
                                    {{ videoFile.name }}
                                </p>
                                <p class="text-xs sm:text-sm text-gray-500">
                                    {{ formatFileSize(videoFile.size) }}
                                </p>
                                <Button
                                    @click.stop="removeVideo"
                                    variant="outline"
                                    size="sm"
                                    class="border-gray-300 hover:bg-gray-100"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>

                        <div v-if="videoFile" class="mt-6">
                            <Button
                                @click="transcribeVideo"
                                :disabled="isTranscribing"
                                variant="default"
                                class="w-full inline-flex items-center justify-center"
                                :class="isTranscribing ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'"
                            >
                                <svg
                                    v-if="isTranscribing"
                                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    ></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {{
                                    isTranscribing
                                        ? 'Transcribing...'
                                        : 'Transcribe Video'
                                }}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <!-- Transcript Output Column -->
                <Card>
                    <CardHeader>
                        <CardTitle>Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            v-if="!transcript && !isTranscribing"
                            class="text-sm sm:text-base text-gray-500 text-center py-6 sm:py-8"
                        >
                            No transcript yet. Upload a video and click
                            "Transcribe Video" to generate.
                        </div>

                        <div
                            v-else-if="isTranscribing"
                            class="text-center py-6 sm:py-8"
                        >
                            <div class="inline-flex items-center space-x-2">
                                <svg
                                    class="animate-spin h-5 w-5 text-gray-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    ></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span class="text-sm sm:text-base text-gray-600"
                                    >Processing video...</span
                                >
                            </div>
                        </div>

                        <div
                            v-else-if="transcript"
                            class="prose prose-sm max-w-none"
                        >
                            <div class="whitespace-pre-wrap text-sm sm:text-base lg:max-h-96 overflow-y-auto">
                                {{ transcript }}
                            </div>
                        </div>

                        <div
                            v-if="error"
                            class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                            <p class="text-red-600 text-xs sm:text-sm">{{ error }}</p>
                        </div>
                    </CardContent>
                </Card>

                <!-- Transcription History Column -->
                <Card class="lg:col-span-2 max-h-[600px] flex flex-col">
                    <CardHeader class="flex-shrink-0">
                        <CardTitle>Transcription History</CardTitle>
                    </CardHeader>
                    <CardContent class="flex-1 overflow-y-auto lg:max-h-none">
                        <div v-if="transcriptions.length === 0" class="text-gray-500 text-center py-8">
                            No transcription history yet.
                        </div>
                        <div v-else class="space-y-3">
                            <div 
                                v-for="trans in transcriptions" 
                                :key="trans.jobId"
                                @click="selectTranscription(trans)"
                                class="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                :class="{
                                    'border-blue-500 bg-blue-50': selectedTranscription?.jobId === trans.jobId
                                }"
                            >
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="font-medium text-xs sm:text-sm">
                                            {{ formatDate(trans.createdAt) }}
                                        </p>
                                        <p class="text-sm mt-1">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                :class="{
                                                    'bg-yellow-100 text-yellow-800': trans.status === 'pending',
                                                    'bg-blue-100 text-blue-800': trans.status === 'processing',
                                                    'bg-green-100 text-green-800': trans.status === 'completed',
                                                    'bg-red-100 text-red-800': trans.status === 'error'
                                                }"
                                            >
                                                {{ trans.status }}
                                            </span>
                                        </p>
                                        <p v-if="trans.transcript" class="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                                            {{ trans.transcript }}
                                        </p>
                                        <p v-else-if="trans.error" class="text-xs sm:text-sm text-red-600 mt-2">
                                            {{ trans.error }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import Card from '~/components/ui/card/Card.vue'
import CardHeader from '~/components/ui/card/CardHeader.vue'
import CardTitle from '~/components/ui/card/CardTitle.vue'
import CardContent from '~/components/ui/card/CardContent.vue'
import Button from '~/components/ui/button/Button.vue'

interface Transcription {
    jobId: string
    status: string
    transcript?: string
    createdAt?: string
    completedAt?: string
    error?: string
}

const videoFile = ref<File | null>(null)
const isDragging = ref(false)
const isTranscribing = ref(false)
const transcript = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const transcriptions = ref<Transcription[]>([])
const selectedTranscription = ref<Transcription | null>(null)

const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('video/')) {
            videoFile.value = file
            error.value = ''
        } else {
            error.value = 'Please upload a valid video file'
        }
    }
}

const openFileDialog = () => {
    fileInput.value?.click()
}

const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('video/')) {
            videoFile.value = file
            error.value = ''
        } else {
            error.value = 'Please upload a valid video file'
        }
    }
}

const removeVideo = () => {
    videoFile.value = null
    transcript.value = ''
    error.value = ''
}

const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

const currentJobId = ref<string | null>(null)
let pollInterval: NodeJS.Timeout | null = null

const transcribeVideo = async () => {
    if (!videoFile.value) return

    isTranscribing.value = true
    error.value = ''
    transcript.value = ''

    try {
        const formData = new FormData()
        formData.append('video', videoFile.value)

        const response = await $fetch<{
            jobId: string
            status: string
            message: string
        }>('/api/transcribe', {
            method: 'POST',
            body: formData,
        })

        currentJobId.value = response.jobId

        // Start polling for results
        startPolling()
        
        // Reload transcriptions to show the new one
        await loadTranscriptions()
    } catch (err) {
        error.value =
            'Failed to submit video for transcription. Please try again.'
        console.error(err)
        isTranscribing.value = false
    }
}

const startPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval)
    }

    pollInterval = setInterval(async () => {
        if (!currentJobId.value) return

        try {
            const status = await $fetch<{
                status: string
                transcript?: string
                error?: string
            }>(`/api/transcription-status/${currentJobId.value}`)

            if (status.status === 'completed' && status.transcript) {
                transcript.value = status.transcript
                isTranscribing.value = false
                stopPolling()
                
                // Reload transcriptions to update status
                await loadTranscriptions()
            } else if (status.status === 'error') {
                error.value = status.error || 'Transcription failed'
                isTranscribing.value = false
                stopPolling()
            }
        } catch (err) {
            console.error('Polling error:', err)
            // Don't stop polling on network errors
        }
    }, 2000) // Poll every 2 seconds
}

const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
    }
}

// Clean up on unmount
onUnmounted(() => {
    stopPolling()
})

// Load transcriptions on mount
onMounted(async () => {
    await loadTranscriptions()
})

const loadTranscriptions = async () => {
    try {
        const data = await $fetch<Transcription[]>('/api/transcriptions')
        transcriptions.value = data
    } catch (err) {
        console.error('Failed to load transcriptions:', err)
    }
}

const selectTranscription = (transcription: Transcription) => {
    selectedTranscription.value = transcription
    transcript.value = transcription.transcript || ''
    error.value = transcription.error || ''
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    // More compact date format for mobile
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}
</script>
