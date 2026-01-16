// lib/startup-check.js
let adminCheckDone = false

export async function ensureAdminExists() {
  if (adminCheckDone || typeof window !== 'undefined') {
    return // Already checked or running in browser
  }
  
  adminCheckDone = true
  console.log('🔍 Running startup admin check...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️ Skipping admin check: Missing env variables')
    return
  }
  
  const { createClient } = await import('@supabase/supabase-js')
  const bcrypt = await import('bcryptjs')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })
  
  try {
    // Check for existing admin
    const { data: admins, error } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
    
    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        console.log('⚠️ Users table not found. Skipping admin creation.')
        return
      }
      console.error('❌ Error checking admins:', error.message)
      return
    }
    
    if (admins && admins.length > 0) {
      console.log('✅ Admin user exists')
      return
    }
    
    // Create admin
    console.log('📝 Creating default admin...')
    const adminEmail = 'hello@kwontum.com'
    const adminPassword = 'KWT6tebing!'
    const adminName = 'System Administrator'
    
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(adminPassword, salt)
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        name: adminName,
        email: adminEmail,
        password_hash: passwordHash,
        is_admin: true,
        status: 'active',
        credit: 0
      })
    
    if (insertError) {
      console.error('❌ Failed to create admin:', insertError.message)
      return
    }
  
    
  } catch (error) {
    console.error('❌ Startup error:', error)
  }
}