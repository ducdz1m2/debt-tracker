import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    // Get pending friend requests
    const { data: requests, error } = await supabase
      .from('friends')
      .select(`
        user_id,
        friend_id,
        status,
        users!friends_user_id_fkey (id, username, full_name, avatar_url)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const formattedRequests = requests?.map((f: any) => ({
      id: f.user_id,
      username: f.users?.username,
      full_name: f.users?.full_name,
      avatar_url: f.users?.avatar_url
    })) || []

    return NextResponse.json({ requests: formattedRequests })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
