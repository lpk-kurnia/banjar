import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, whatsapp, address, program } = body

    // Validasi input
    if (!name || !email || !whatsapp || !address || !program) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Validasi program
    if (!['hardware', 'software', 'both'].includes(program)) {
      return NextResponse.json(
        { error: 'Program tidak valid' },
        { status: 400 }
      )
    }

    // Simpan ke database
    const registration = await db.registration.create({
      data: {
        name,
        email,
        whatsapp,
        address,
        program
      }
    })

    return NextResponse.json(
      { success: true, data: registration },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const registrations = await db.registration.findMany({
      orderBy: {
        registeredAt: 'desc'
      }
    })

    return NextResponse.json({ data: registrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}
