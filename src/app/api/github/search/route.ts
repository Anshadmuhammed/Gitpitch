import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const languages = searchParams.get('languages')?.split(',') || []
    const city = searchParams.get('city')
    const openToWork = searchParams.get('open_to_work')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = await createServer()

    // Base query
    let query = supabase
      .from('developer_profiles')
      .select('*, users (name, avatar_url)', { count: 'exact' })

    // Apply filters
    if (languages.length > 0) {
      // Supabase contains operator for array columns
      query = query.contains('top_languages', languages)
    }

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (openToWork === 'true') {
      query = query.eq('open_to_work', true)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)
    
    // Sort by best profiles (stars/followers logic)
    query = query.order('total_stars', { ascending: false })

    const { data, count, error } = await query

    if (error) {
       console.error('Search Database Error:', error)
       return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      results: data,
      total: count,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
