import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 이 클라이언트를 통해 Supabase의 다양한 기능(인증, 데이터베이스 등)에 접근할 수 있습니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
