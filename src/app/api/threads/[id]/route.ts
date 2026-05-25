import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const thread = await db.thread.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          }
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread tidak ditemukan' },
        { status: 404 }
      )
    }

    // Increment view count
    await db.thread.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({ data: thread })
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data thread' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content } = body

    const thread = await db.thread.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          }
        }
      }
    })

    return NextResponse.json({ data: thread })
  } catch (error) {
    console.error('Error updating thread:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate thread' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.thread.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting thread:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus thread' },
      { status: 500 }
    )
  }
}
