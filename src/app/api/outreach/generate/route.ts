import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

// OpenAI is initialized inside the handler to prevent build-time errors when API key is missing

export async function POST(request: Request) {
  try {
    const { developer_id, job_description, tone } = await request.json()
    
    const supabase = await createClient()
    
    const { data: dev } = await supabase
      .from('developer_profiles')
      .select('*')
      .eq('id', developer_id)
      .single()

    if (!dev) return NextResponse.json({ error: 'Developer not found' }, { status: 404 })

    const toneMap = {
      professional: 'formal and professional',
      friendly: 'warm and conversational', 
      direct: 'brief and direct'
    }

    const prompt = `
Developer: ${dev.github_username}
Top languages: ${dev.top_languages?.join(', ')}
Top repos: ${dev.top_repos?.slice(0,3).map((r: any) => 
  `${r.name} (${r.stars}⭐) — ${r.description}`).join('; ')}
Bio: ${dev.bio}
Role being hired for: ${job_description}
Tone: ${toneMap[tone as keyof typeof toneMap] || 'friendly'}

Write a cold outreach email. Max 120 words.
Reference at least 2 specific repos or languages.
First line is subject, then ---, then body.
End with a low-pressure CTA.
  `

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build' 
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are writing cold outreach emails for Indian startup recruiters. Be human, warm, specific.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    })

    const text = response.choices[0].message.content || ''
    const parts = text.split('---')
    const subject = parts[Part_index()]?.replace('Subject:', '').trim() || `Outreach to ${dev.github_username}`
    const body = parts.length > 1 ? parts.slice(1).join('').trim() : parts[0].trim()

    function Part_index() {
      if (parts.length > 1) return 0
      return -1
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    // We link directly to user id since recruiter_profiles might be deprecated in favor of users table
    const { data: campaign, error: campaignError } = await supabase.from('outreach_campaigns').insert({
      recruiter_id: user?.id,
      developer_id,
      subject,
      body,
      status: 'draft'
    }).select('id').single()

    if (campaignError) {
       console.error('Campaign save error:', campaignError)
    }

    return NextResponse.json({ id: campaign?.id, subject, body })
  } catch (err: any) {
    console.error('Outreach generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
