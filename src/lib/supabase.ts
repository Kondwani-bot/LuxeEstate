import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://juvrjybfkqcdsyflckso.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Y6MMp6Lq465rPtSXieh9RQ_aigJ1O8x';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
