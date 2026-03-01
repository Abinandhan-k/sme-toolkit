import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://vxrgfpxppdrehyffujdp.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmdmcHhwcGRyZWh5ZmZ1amRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDcwODYsImV4cCI6MjA4NzgyMzA4Nn0.xT3u40lG_hhfLSVRzQFFGtXl1fJQoP6R_IcI29F8DVI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)