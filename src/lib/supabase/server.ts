import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabase = () => {
  const cookieStore = cookies()
  return createServerComponentClient({
    cookies: () => cookieStore,
  })
} 