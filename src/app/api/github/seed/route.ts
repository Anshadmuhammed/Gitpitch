import { NextResponse } from 'next/server'

const INDIAN_DEVS = [
  'kamranahmedse', 'trekhleb', 'Asabeneh', 'bradtraversy',
  'wesbos', 'nicolo-ribaudo', 'antfu', 'yyx990803',
  'gaearon', 'sindresorhus', 'tj', 'addyosmani',
  'developit', 'paulirish', 'getify', 'substack',
  'jashkenas', 'mdo', 'fat', 'dexteryy'
]

export async function POST() {
  const results = []
  for (const username of INDIAN_DEVS) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/github/sync/${username}`,
        { method: 'POST' }
      )
      const data = await res.json()
      results.push({ username, success: data.success, error: data.error })
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      results.push({ username, success: false, error: String(err) })
    }
  }
  return NextResponse.json({ results })
}
