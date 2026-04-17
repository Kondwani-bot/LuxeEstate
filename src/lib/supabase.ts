import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://juvrjybfkqcdsyflckso.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Y6MMp6Lq465rPtSXieh9RQ_aigJ1O8x';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
