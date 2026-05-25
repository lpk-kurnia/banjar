import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await db.comment.findMany({
      where: { threadId: id, parentId: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            votes: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ data: comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data komentar' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Anda harus login untuk berkomentar' },
        { status: 401 }
      )
    }

    if (currentUser.isBanned) {
      return NextResponse.json(
        { error: 'Akun Anda di-suspend' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, image, parentId } = body

    if (!content && !image) {
      return NextResponse.json(
        { error: 'Konten atau gambar komentar wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah thread ada dan tidak locked
    const thread = await db.thread.findUnique({
      where: { id }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread tidak ditemukan' },
        { status: 404 }
      )
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread ini dikunci, tidak bisa berkomentar' },
        { status: 403 }
      )
    }

    // Jika parentId ada, cek apakah parent comment ada
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Komentar induk tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    const comment = await db.comment.create({
      data: {
        content: content || '',
        image: image || null,
        threadId: id,
        authorId: currentUser.id,
        parentId: parentId || null,
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
        _count: {
          select: {
            votes: true,
          }
        }
      }
    })

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat komentar' },
      { status: 500 }
    )
  }
}
