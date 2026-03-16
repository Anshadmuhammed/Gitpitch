import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { developer_id, subject, body } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Check credits
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.credits || 0) <= 0) {
      return NextResponse.json({ error: 'Insufficent credits' }, { status: 403 })
    }

    // 2. Save campaign
    const { error: campaignError } = await supabase
      .from('outreach_campaigns')
      .insert({
        recruiter_id: user.id,
        developer_id,
        subject,
        body,
        status: 'sent'
      })

    if (campaignError) throw campaignError

    // 3. Deduct credit
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: (userData.credits || 0) - 1 })
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Send error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
