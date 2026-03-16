import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
    const subject = parts[0].replace('Subject:', '').trim()
    const body = parts.slice(1).join('').trim()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: recruiter } = await supabase
      .from('recruiter_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    const { data: campaign } = await supabase.from('outreach_campaigns').insert({
      recruiter_id: recruiter?.id,
      developer_id,
      subject,
      body,
      status: 'draft'
    }).select('id').single()

    return NextResponse.json({ id: campaign?.id, subject, body })
  } catch (err: any) {
    console.error('Outreach generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
