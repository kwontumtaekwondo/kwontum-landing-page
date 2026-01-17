// lib/supabase-server.js - UPDATED VERSION
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`)
}

export const supabaseServer = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-client-info': 'kwontum-landing-page',
        // Add cache control headers
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Override fetch to ensure no caching
      fetch: (url, options = {}) => {
        // Add cache bust parameter
        const separator = url.includes('?') ? '&' : '?'
        const bustedUrl = `${url}${separator}_nocache=${Date.now()}`
        
        return fetch(bustedUrl, {
          ...options,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        })
      }
    }
  }
)