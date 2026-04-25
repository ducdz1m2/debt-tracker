import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Đăng xuất thành công' },
      { status: 200 }
    )

    // Clear auth cookies
    response.cookies.set('user_id', '', { maxAge: 0, path: '/' })
    response.cookies.set('username', '', { maxAge: 0, path: '/' })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
