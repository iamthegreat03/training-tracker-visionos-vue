import { createClient } from '@supabase/supabase-js'

const SURL = 'https://bywxiwxotysrkffmziyg.supabase.co'
const SKEY = 'sb_publishable_rsL-N6n35C0JRWAcT7E3cQ_9y3ky5MH'

export const db = createClient(SURL, SKEY)
