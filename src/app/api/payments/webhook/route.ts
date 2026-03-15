import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'secret'

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    // Handle the event
    if (event.event === 'payment.captured') {
       const payment = event.payload.payment.entity;
       console.log(`Payment of ${payment.amount} captured for order ${payment.order_id}`);
       // TODO: Update users table subscription status in Supabase
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
