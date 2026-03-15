import { NextResponse } from 'next/server'
import { BrevoClient } from '@getbrevo/brevo'

export async function POST(request: Request) {
  try {
    const { toEmail, subject, content } = await request.json()

    if (!toEmail || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.includes('your_')) {
      // Mock sending if API key isn't real
      console.log('Mock email sent to', toEmail);
      return NextResponse.json({ success: true, mock: true })
    }

    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })

    await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: `<div style="font-family: sans-serif; white-space: pre-wrap;">${content}</div>`,
      sender: { name: "Gitpitch Recruiter", email: "hello@gitpitch.demo" },
      to: [{ email: toEmail }],
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Brevo Send Error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
