import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isBanned, banReason, banExpiry } = body

    const user = await db.user.update({
      where: { id },
      data: {
        isBanned,
        banReason,
        banExpiry: banExpiry ? new Date(banExpiry) : null
      }
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
