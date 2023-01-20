import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://utkhbxarwnbxsysczcch.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a2hieGFyd25ieHN5c2N6Y2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM1OTMyNTgsImV4cCI6MTk4OTE2OTI1OH0.WQv3iMuDHXscnMh-2de_1EplNmPX0ZJShYAjuSW3EL0')
