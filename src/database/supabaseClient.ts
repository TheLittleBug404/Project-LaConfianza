import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiykvhcmtsnwmhgpsyab.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpeWt2aGNtdHNud21oZ3BzeWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMzI5ODEsImV4cCI6MjExMDcwODk4MX0.cT8B4L4XoBaxqEeAIjYN5QIUfWTGBrUJmc7asfkEMjI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    }
  }
});
