import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fidbzymgdmzyacbpciie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZGJ6eW1nZG16eWFjYnBjaWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5Mjc0NTMsImV4cCI6MjA2MTUwMzQ1M30.KcDTSeYoqKgJteL3DEcsVWiCvOMnEsWxbr1-DJXMgRw';

export const supabase = createClient(supabaseUrl, supabaseKey);

