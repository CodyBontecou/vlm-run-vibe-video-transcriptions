<template>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto p-4 sm:p-6 max-w-7xl">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Video Transcription
            </h1>

            <!-- API Key Section -->
            <div
                v-if="!hasApiKey"
                class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
            >
                <h2 class="text-lg font-semibold mb-2">
                    VLM Run API Key Required
                </h2>
                <p class="text-sm text-gray-600 mb-3">
                    To use this application, you need a VLM Run API key.
                    <a
                        href="https://app.vlm.run/dashboard"
                        target="_blank"
                        class="text-blue-600 hover:text-blue-800 underline"
                        >Get your API key here</a
                    >
                </p>
                <div class="flex gap-2">
                    <input
                        v-model="apiKeyInput"
                        type="password"
                        placeholder="Enter your VLM Run API key"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @keyup.enter="saveApiKey"
                    />
                    <button
                        @click="saveApiKey"
                        :disabled="!apiKeyInput"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Save Key
                    </button>
                </div>
            </div>

            <!-- API Key Info (when saved) -->
            <div
                v-else
                class="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex justify-between items-center"
            >
                <div class="flex items-center gap-2">
                    <svg
                        class="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <span class="text-sm text-green-800"
                        >API Key configured</span
                    >
                </div>
                <button
                    @click="clearApiKey"
                    class="text-sm text-red-600 hover:text-red-800"
                >
                    Remove Key
                </button>
            </div>

            <!-- Main content area -->
            <div class="space-y-6" v-if="hasApiKey">
                <!-- Top row: Upload and Transcript -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Video Upload Card -->
                    <div
                        class="bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                        <div class="p-4 border-b border-gray-200">
                            <h2 class="text-lg font-semibold">Upload Video</h2>
                        </div>
                        <div class="p-4">
                            <div
                                @drop="handleDrop"
                                @dragover.prevent
                                @dragenter.prevent="isDragging = true"
                                @dragleave.prevent="isDragging = false"
                                @click="openFileDialog"
                                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
                                <div v-if="!videoFile" class="space-y-3">
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
                                    <p class="text-base text-gray-600">
                                        Drag and drop your video file here
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        or click to browse
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        Supported formats: MP4, MOV, AVI, WebM
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        Maximum file size: 4.5MB (Vercel Hobby) / 100MB (Vercel Pro)
                                    </p>
                                </div>

                                <div v-else class="space-y-3">
                                    <p
                                        class="text-base text-gray-700 font-medium break-all"
                                    >
                                        {{ videoFile.name }}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {{ formatFileSize(videoFile.size) }}
                                    </p>
                                    <button
                                        @click.stop="removeVideo"
                                        class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div v-if="videoFile" class="mt-4">
                                <button
                                    @click="transcribeVideo"
                                    :disabled="isTranscribing"
                                    class="w-full px-4 py-2 text-white rounded-md transition-colors"
                                    :class="
                                        isTranscribing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gray-900 hover:bg-gray-800'
                                    "
                                >
                                    <span
                                        v-if="isTranscribing"
                                        class="flex items-center justify-center"
                                    >
                                        <svg
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
                                        Transcribing...
                                    </span>
                                    <span v-else>Transcribe Video</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Transcript Card -->
                    <div
                        class="bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                        <div class="p-4 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h2 class="text-lg font-semibold">
                                    Transcript
                                </h2>
                                <div
                                    v-if="selectedTranscription"
                                    class="flex items-center gap-2"
                                >
                                    <span class="text-sm text-gray-500">
                                        {{
                                            formatDate(
                                                selectedTranscription.createdAt
                                            )
                                        }}
                                    </span>
                                    <button
                                        @click="clearSelection"
                                        class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="p-4">
                            <div
                                v-if="
                                    !transcript &&
                                    !isTranscribing &&
                                    !selectedTranscription &&
                                    !isLoadingTranscriptionDetails
                                "
                                class="text-gray-500 text-center py-8"
                            >
                                No transcript yet. Upload a video and click
                                "Transcribe Video" to generate.
                            </div>

                            <div
                                v-else-if="isLoadingTranscriptionDetails"
                                class="text-center py-8"
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
                                    <span class="text-gray-600">Loading transcript details...</span>
                                </div>
                            </div>

                            <div
                                v-else-if="isTranscribing"
                                class="text-center py-8"
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
                                    <span class="text-gray-600"
                                        >Processing video...</span
                                    >
                                </div>
                            </div>

                            <div
                                v-else-if="transcript || selectedTranscription"
                                class="space-y-4"
                            >
                                <!-- Status and metadata -->
                                <div
                                    v-if="selectedTranscription"
                                    class="pb-3 border-b border-gray-200"
                                >
                                    <div
                                        class="flex items-center gap-2 text-sm text-gray-600"
                                    >
                                        <span class="font-medium">Status:</span>
                                        <span
                                            class="px-2 py-0.5 rounded text-xs font-medium"
                                            :class="{
                                                'bg-yellow-100 text-yellow-800':
                                                    selectedTranscription.status ===
                                                    'pending',
                                                'bg-blue-100 text-blue-800':
                                                    selectedTranscription.status ===
                                                    'processing',
                                                'bg-green-100 text-green-800':
                                                    selectedTranscription.status ===
                                                    'completed',
                                                'bg-red-100 text-red-800':
                                                    selectedTranscription.status ===
                                                    'error',
                                            }"
                                        >
                                            {{ selectedTranscription.status }}
                                        </span>
                                    </div>

                                    <div
                                        v-if="
                                            selectedTranscription.prediction
                                                ?.usage
                                        "
                                        class="text-sm text-gray-600 mt-1"
                                    >
                                        <span class="font-medium"
                                            >Credits:</span
                                        >
                                        {{
                                            selectedTranscription.prediction
                                                .usage.credits_used || 0
                                        }}
                                    </div>
                                </div>

                                <!-- Transcript content -->
                                <div v-if="transcript">
                                    <h4
                                        class="text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Transcript:
                                    </h4>
                                    <div
                                        class="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto"
                                    >
                                        <p
                                            class="text-sm whitespace-pre-wrap break-words"
                                        >
                                            {{ transcript }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Full response data -->
                                <details
                                    v-if="
                                        selectedTranscription?.prediction
                                            ?.response ||
                                        selectedTranscription?.fullResponse
                                    "
                                    class="mt-4"
                                >
                                    <summary
                                        class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        View Full Response Data
                                    </summary>
                                    <pre
                                        class="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64"
                                        >{{
                                            JSON.stringify(
                                                selectedTranscription.prediction
                                                    ?.response ||
                                                    selectedTranscription.fullResponse,
                                                null,
                                                2
                                            )
                                        }}</pre
                                    >
                                </details>
                            </div>

                            <div
                                v-if="error"
                                class="mt-4 p-4 bg-red-50 border border-red-200 rounded"
                            >
                                <p class="text-red-600 text-sm">{{ error }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Transcription History -->
                <div
                    class="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                    <div class="p-4 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-lg font-semibold">
                                Transcription History
                            </h2>
                            <button
                                @click="loadTranscriptions"
                                :disabled="isLoadingHistory"
                                class="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4"
                                    :class="{ 'animate-spin': isLoadingHistory }"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {{ isLoadingHistory ? 'Loading...' : 'Refresh' }}
                            </button>
                        </div>
                    </div>
                    <div class="p-4 max-h-96 overflow-y-auto">
                        <div
                            v-if="isLoadingHistory && transcriptions.length === 0"
                            class="text-center py-8"
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
                                <span class="text-gray-600">Loading transcriptions...</span>
                            </div>
                        </div>
                        <div
                            v-else-if="!isLoadingHistory && transcriptions.length === 0"
                            class="text-gray-500 text-center py-8"
                        >
                            No transcription history yet.
                        </div>
                        <div v-else class="space-y-3">
                            <div
                                v-for="trans in transcriptions"
                                :key="trans.jobId"
                                @click="selectTranscription(trans)"
                                class="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors relative"
                                :class="{
                                    'border-blue-500 bg-blue-50':
                                        selectedTranscription?.jobId ===
                                        trans.jobId,
                                    'border-gray-200':
                                        selectedTranscription?.jobId !==
                                        trans.jobId,
                                    'opacity-75 pointer-events-none':
                                        isLoadingTranscriptionDetails
                                }"
                            >
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="font-medium text-sm">
                                            {{ formatDate(trans.createdAt) }}
                                        </p>
                                        <p class="text-sm mt-1">
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                :class="{
                                                    'bg-yellow-100 text-yellow-800':
                                                        trans.status ===
                                                        'pending',
                                                    'bg-blue-100 text-blue-800':
                                                        trans.status ===
                                                        'processing',
                                                    'bg-green-100 text-green-800':
                                                        trans.status ===
                                                        'completed',
                                                    'bg-red-100 text-red-800':
                                                        trans.status ===
                                                        'error',
                                                }"
                                            >
                                                {{ trans.status }}
                                            </span>
                                        </p>
                                        <p
                                            v-if="trans.transcript"
                                            class="text-sm text-gray-600 mt-2 line-clamp-2"
                                        >
                                            {{ trans.transcript }}
                                        </p>
                                        <p
                                            v-else-if="trans.error"
                                            class="text-sm text-red-600 mt-2"
                                        >
                                            {{ trans.error }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from 'vue'

// API Key management
const { apiKey, setApiKey, clearApiKey: removeApiKey, hasApiKey } = useApiKey()
const apiKeyInput = ref('')

const saveApiKey = () => {
    if (apiKeyInput.value.trim()) {
        setApiKey(apiKeyInput.value.trim())
        apiKeyInput.value = ''
    }
}

const clearApiKey = () => {
    removeApiKey()
}

interface Transcription {
    jobId: string
    status: string
    transcript?: string
    createdAt?: string
    completedAt?: string
    error?: string
    prediction?: {
        id: string
        status: string
        created_at: string
        completed_at?: string
        response?: any
        usage?: {
            credits_used?: number
            elements_processed?: number
            element_type?: string
        }
    }
    fullResponse?: any
}

const videoFile = ref<File | null>(null)
const isDragging = ref(false)
const isTranscribing = ref(false)
const transcript = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const transcriptions = ref<Transcription[]>([])
const selectedTranscription = ref<Transcription | null>(null)
const isLoadingHistory = ref(false)
const isLoadingTranscriptionDetails = ref(false)

const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('video/')) {
            // Check file size (4.5MB limit for Vercel Hobby, 100MB for Pro)
            const maxSize = 4.5 * 1024 * 1024 // 4.5MB for Vercel Hobby
            if (file.size > maxSize) {
                error.value = `Video file too large. Maximum size is 4.5MB on Vercel Hobby plan (100MB on Pro), your file is ${Math.round(file.size / 1024 / 1024)}MB`
                return
            }
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
            // Check file size (4.5MB limit for Vercel Hobby, 100MB for Pro)
            const maxSize = 4.5 * 1024 * 1024 // 4.5MB for Vercel Hobby
            if (file.size > maxSize) {
                error.value = `Video file too large. Maximum size is 4.5MB on Vercel Hobby plan (100MB on Pro), your file is ${Math.round(file.size / 1024 / 1024)}MB`
                return
            }
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
            headers: {
                'x-api-key': apiKey.value || '',
            },
        })

        currentJobId.value = response.jobId

        // POLLING COMMENTED OUT FOR CALLBACK TESTING
        // Uncomment this line to enable client-side polling
        // startPolling()

        // Reload transcriptions to show the new one
        await loadTranscriptions()

        // Start refreshing transcription list while processing
        startTranscriptionRefresh()
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
    }, 5000) // Poll every 5 seconds
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

// Track refresh interval
let refreshInterval: NodeJS.Timeout | null = null

// Start refreshing transcription list
const startTranscriptionRefresh = () => {
    // Clear any existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }

    // Refresh every 5 seconds to check for callback updates
    refreshInterval = setInterval(async () => {
        await loadTranscriptions()

        // Check if we still have any processing transcriptions
        const hasProcessing = transcriptions.value.some(
            t => t.status === 'processing' || t.status === 'pending'
        )

        // Stop refreshing if no transcriptions are processing
        if (!hasProcessing) {
            stopTranscriptionRefresh()
        }
    }, 5000)
}

// Stop refreshing transcription list
const stopTranscriptionRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
    }
}

// Load transcriptions on mount
onMounted(async () => {
    if (hasApiKey.value) {
        await loadTranscriptions()

        // Check if any transcriptions are processing on mount
        const hasProcessing = transcriptions.value.some(
            t => t.status === 'processing' || t.status === 'pending'
        )

        if (hasProcessing) {
            startTranscriptionRefresh()
        }
    }
})

// Watch for API key changes
watch(hasApiKey, async newValue => {
    if (newValue) {
        await loadTranscriptions()
    } else {
        transcriptions.value = []
        selectedTranscription.value = null
        transcript.value = ''
    }
})

// Clean up on unmount
onUnmounted(() => {
    stopTranscriptionRefresh()
})

const loadTranscriptions = async () => {
    isLoadingHistory.value = true
    try {
        const data = await $fetch<Transcription[]>('/api/transcriptions', {
            headers: {
                'x-api-key': apiKey.value || '',
            },
        })
        transcriptions.value = data
    } catch (err) {
        console.error('Failed to load transcriptions:', err)
    } finally {
        isLoadingHistory.value = false
    }
}

const selectTranscription = async (transcription: Transcription) => {
    isLoadingTranscriptionDetails.value = true
    try {
        // Fetch full transcription details
        const fullData = await $fetch(
            `/api/transcription/${transcription.jobId}`,
            {
                headers: {
                    'x-api-key': apiKey.value || '',
                },
            }
        )

        selectedTranscription.value = fullData

        // Extract transcript based on the response structure
        if (fullData.transcript) {
            transcript.value = fullData.transcript
        } else if (fullData.prediction?.response?.segments) {
            // Extract from segments if available
            transcript.value = fullData.prediction.response.segments
                .map((segment: any) => segment.audio?.content || '')
                .filter((text: string) => text.length > 0)
                .join(' ')
        } else if (fullData.fullResponse?.response?.segments) {
            // Try fullResponse if stored from callback
            transcript.value = fullData.fullResponse.response.segments
                .map((segment: any) => segment.audio?.content || '')
                .filter((text: string) => text.length > 0)
                .join(' ')
        } else {
            transcript.value = ''
        }

        error.value = fullData.error || ''

        // Clear the transcribing state when selecting a transcription
        isTranscribing.value = false
        // Clear video file to show the transcript
        videoFile.value = null
    } catch (err) {
        console.error('Failed to fetch transcription details:', err)
        error.value = 'Failed to load transcription details'
    } finally {
        isLoadingTranscriptionDetails.value = false
    }
}

const clearSelection = () => {
    selectedTranscription.value = null
    transcript.value = ''
    error.value = ''
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    // More compact date format for mobile
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
