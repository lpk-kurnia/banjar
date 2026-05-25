import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comment = await db.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Komentar tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: comment })
  } catch (error) {
    console.error('Error fetching comment:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data komentar' },
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Anda harus login' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Konten wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah komentar ada
    const comment = await db.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Komentar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah user adalah author atau admin
    const isAuthor = comment.authorId === session.user.id
    const isAdmin = session.user.role === 'SUPER_ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk mengedit komentar ini' },
        { status: 403 }
      )
    }

    const updatedComment = await db.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json({ data: updatedComment })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate komentar' },
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Anda harus login' },
        { status: 401 }
      )
    }

    // Cek apakah komentar ada
    const comment = await db.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Komentar tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah user adalah author atau admin
    const isAuthor = comment.authorId === session.user.id
    const isAdmin = session.user.role === 'SUPER_ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk menghapus komentar ini' },
        { status: 403 }
      )
    }

    await db.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus komentar' },
      { status: 500 }
    )
  }
}
