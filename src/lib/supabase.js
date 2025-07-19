import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zsiooxtbjviimlrxtyei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaW9veHRianZpaW1scnh0eWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc4OTYsImV4cCI6MjA2ODUxMzg5Nn0.DK2iOBshHNtWlmxyj25Jzgi0XkboBED654w8mmtjW2I';

export const supabase = createClient(supabaseUrl, supabaseKey);


