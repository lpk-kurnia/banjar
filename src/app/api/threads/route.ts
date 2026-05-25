import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')

    const threads = await db.thread.findMany({
      where: categoryId ? { categoryId } : undefined,
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
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ data: threads })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data thread' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Anda harus login untuk membuat thread' },
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
    const { title, content, categoryId, image } = body

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Judul, konten, dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    const category = await db.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    const thread = await db.thread.create({
      data: {
        title,
        content,
        image: image || null,
        categoryId,
        authorId: currentUser.id,
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
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      }
    })

    return NextResponse.json({ data: thread }, { status: 201 })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat thread' },
      { status: 500 }
    )
  }
}
