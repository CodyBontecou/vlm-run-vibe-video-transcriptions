// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    strict: true
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    // For Vercel deployment, set function configuration
    vercel: {
      functions: {
        maxDuration: 300, // 5 minutes
        // Note: Vercel has a 4.5MB limit for request body on Hobby plan
        // Pro plan supports up to 100MB
      }
    },
    // For other deployments, increase raw body size
    rollupConfig: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
