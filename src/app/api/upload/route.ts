import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

// Admin client (bypasses RLS for upload operations)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify user is logged in and not banned
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.isBanned) {
      return NextResponse.json({ error: 'Akun Anda di-suspend' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10 MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 10 MB' },
        { status: 400 }
      )
    }

    // Generate unique path: {authUid}/{timestamp}-{random}.{ext}
    const ext = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filePath = `${user.authId}/${timestamp}-${random}.${ext}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('forum-images')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache (images don't change)
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Gagal upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('forum-images')
      .getPublicUrl(filePath)

    return NextResponse.json({
      data: {
        url: urlData.publicUrl,
        path: filePath
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path } = await request.json()
    if (!path) {
      return NextResponse.json({ error: 'Path tidak diberikan' }, { status: 400 })
    }

    // Only admin can delete, or user can delete their own folder files
    if (user.role !== 'SUPER_ADMIN') {
      const userFolder = `${user.authId}/`
      if (!path.startsWith(userFolder)) {
        return NextResponse.json({ error: 'Tidak bisa menghapus file orang lain' }, { status: 403 })
      }
    }

    const { error: deleteError } = await supabaseAdmin.storage
      .from('forum-images')
      .remove([path])

    if (deleteError) {
      return NextResponse.json(
        { error: `Gagal menghapus: ${deleteError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus' },
      { status: 500 }
    )
  }
}
