import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Hanya SUPER_ADMIN yang dapat menghapus thread' },
        { status: 403 }
      )
    }

    const thread = await db.thread.findUnique({
      where: { id }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.thread.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Thread berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting thread:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
