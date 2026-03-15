import { NextResponse } from 'next/server'
import * as brevo from '@getbrevo/brevo'
import { createServer } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createServer()
    
    // Store in a 'waitlist' table
    // If the table doesn't exist yet, it'll error, but this is standard for Supabase integration
    const { error: dbError } = await supabase.from('waitlist').insert({ email })
    if (dbError && dbError.code !== '23505') { // Ignore unique constraint for duplicates
      console.error('Waitlist DB Error:', dbError)
    }

    // Send Welcome Email
    if (process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes('your_')) {
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.subject = "You're on the list — Welcome to Gitpitch"
      sendSmtpEmail.htmlContent = `<div style="font-family: sans-serif; white-space: pre-wrap;">Hi there,

Thanks for joining the waitlist for Gitpitch! We are building India's largest tech talent platform powered entirely by GitHub.

We'll let you know as soon as your account is ready.

Best,
The Gitpitch Team</div>`
      sendSmtpEmail.sender = { name: "Gitpitch", email: "hello@gitpitch.demo" }
      sendSmtpEmail.to = [{ email }]

      await apiInstance.sendTransacEmail(sendSmtpEmail)
    } else {
      console.log('Mock: Welcome email sent to', email);
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Waitlist Error:', error)
    return NextResponse.json({ error: 'Failed to process waitlist request' }, { status: 500 })
  }
}
