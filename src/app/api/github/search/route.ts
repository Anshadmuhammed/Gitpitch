import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const languages = searchParams.get('languages')?.split(',').filter(Boolean)
  const city = searchParams.get('city')
  const openToWork = searchParams.get('open_to_work')
  const limit = parseInt(searchParams.get('limit') || '20')

  const supabase = await createClient()
  let query = supabase
    .from('developer_profiles')
    .select('*')
    .order('total_stars', { ascending: false })
    .limit(limit)

  if (languages && languages.length > 0) {
    query = query.overlaps('top_languages', languages)
  }
  if (city && city !== 'all') {
    query = query.ilike('city', `%${city}%`)
  }
  if (openToWork === 'true') {
    query = query.eq('open_to_work', true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ results: data, count: data?.length || 0 })
}
