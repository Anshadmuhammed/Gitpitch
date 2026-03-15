import { NextResponse } from 'next/server'
import * as brevo from '@getbrevo/brevo'

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

    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = `<div style="font-family: sans-serif; white-space: pre-wrap;">${content}</div>`
    sendSmtpEmail.sender = { name: "Gitpitch Recruiter", email: "hello@gitpitch.demo" }
    sendSmtpEmail.to = [{ email: toEmail }]

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    return NextResponse.json({ success: true, messageId: result.body.messageId })
  } catch (error: any) {
    console.error('Brevo Send Error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
