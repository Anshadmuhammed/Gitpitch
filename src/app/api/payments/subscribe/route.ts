import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_123',
})

// Mapping of plan IDs to amounts in paise (INR * 100)
const PLAN_AMOUNTS: Record<string, number> = {
  'plan_starter': 4999 * 100,
  'plan_growth': 14999 * 100,
}

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()

    if (!PLAN_AMOUNTS[planId]) {
       return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Usually you would setup a Subscription with Razorpay
    // For simplicity in this demo, we can just create an Order for a one-time payment
    // that acts as the first month's payment

    const amount = PLAN_AMOUNTS[planId]
    
    // In a real scenario with placeholders, Razorpay SDK fails if key is 'rzp_test_123'
    // but we add it to show the correct integration pattern.
    if (process.env.RAZORPAY_KEY_ID?.includes('your_')) {
      return NextResponse.json({ orderId: 'order_mock_12345', amount })
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { planId }
    })

    return NextResponse.json({ orderId: order.id, amount })
  } catch (error: any) {
    console.error('Payment Error:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
