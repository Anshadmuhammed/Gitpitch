import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { campaign_id, developer_email } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: recruiter } = await supabase
      .from('users')
      .select('id, credits')
      .eq('id', user?.id)
      .single()

    if (!recruiter || (recruiter.credits || 0) < 1) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
    }

    // 1. Deduct credit
    await supabase
      .from('users')
      .update({ credits: (recruiter.credits || 0) - 1 })
      .eq('id', recruiter.id)

    // 2. Update campaign status
    await supabase
      .from('outreach_campaigns')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', campaign_id)

    return NextResponse.json({ success: true, credits_remaining: (recruiter.credits || 0) - 1 })
  } catch (err: any) {
    console.error('Send outreach error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
