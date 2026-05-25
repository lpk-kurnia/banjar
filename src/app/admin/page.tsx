'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LayoutDashboard, Users, FileText, Download, Search, ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Registration {
  id: string
  name: string
  email: string
  whatsapp: string
  address: string
  program: string
  registeredAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'registrations' | 'users'>('registrations')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      router.push('/forum')
      return
    }

    fetchRegistrations()
  }, [session, status, router])

  useEffect(() => {
    if (searchQuery) {
      const filtered = registrations.filter(reg =>
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.whatsapp.includes(searchQuery)
      )
      setFilteredRegistrations(filtered)
    } else {
      setFilteredRegistrations(registrations)
    }
  }, [searchQuery, registrations])

  const fetchRegistrations = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/registrations')
      const data = await res.json()
      setRegistrations(data.data || [])
      setFilteredRegistrations(data.data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = () => {
    const headers = ['No', 'Nama', 'Email', 'WhatsApp', 'Alamat', 'Program', 'Tanggal Daftar']
    const rows = filteredRegistrations.map((reg, index) => [
      index + 1,
      `"${reg.name}"`,
      reg.email,
      reg.whatsapp,
      `"${reg.address.replace(/"/g, '""')}"`,
      reg.program.toUpperCase(),
      new Date(reg.registeredAt).toLocaleDateString('id-ID')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pendaftaran-lpk-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getProgramBadge = (program: string) => {
    switch (program) {
      case 'hardware':
        return <Badge className="bg-blue-600">Hardware</Badge>
      case 'software':
        return <Badge className="bg-green-600">Software</Badge>
      case 'both':
        return <Badge className="bg-purple-600">Keduanya</Badge>
      default:
        return <Badge>{program}</Badge>
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-blue-300">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-950/95 backdrop-blur-sm border-b border-blue-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/forum" className="text-blue-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="LPK Kurnia Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold text-white">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-blue-300">{session?.user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="bg-blue-600 hover:bg-blue-500 text-white border-blue-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <Card className="bg-blue-950/50 border-blue-800 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('registrations')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        activeTab === 'registrations'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-200 hover:bg-blue-900/50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Pendaftaran LPK
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        activeTab === 'users'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-200 hover:bg-blue-900/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Manajemen User
                    </button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Registrations Tab */}
              {activeTab === 'registrations' && (
                <Card className="bg-blue-950/50 border-blue-800">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="text-white">Pendaftaran LPK</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                          <Input
                            placeholder="Cari..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400 w-full sm:w-64"
                          />
                        </div>
                        <Button
                          onClick={downloadCSV}
                          disabled={filteredRegistrations.length === 0}
                          className="bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Excel
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredRegistrations.length === 0 ? (
                      <div className="text-center py-12 text-blue-300">
                        {searchQuery ? 'Tidak ada data yang ditemukan' : 'Belum ada pendaftar'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-blue-800">
                              <TableHead className="text-blue-200">No</TableHead>
                              <TableHead className="text-blue-200">Nama</TableHead>
                              <TableHead className="text-blue-200">No WhatsApp</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRegistrations.map((reg, index) => (
                              <TableRow key={reg.id} className="border-blue-800 hover:bg-blue-900/30">
                                <TableCell className="text-blue-100">{index + 1}</TableCell>
                                <TableCell className="text-blue-100 font-medium">{reg.name}</TableCell>
                                <TableCell className="text-blue-300">{reg.whatsapp}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Users Tab - Placeholder for future */}
              {activeTab === 'users' && (
                <Card className="bg-blue-950/50 border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-white">Manajemen User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-blue-300">
                      <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p>Fitur manajemen user akan segera hadir.</p>
                      <p className="text-sm mt-2">Anda bisa ban/unban user langsung dari halaman forum.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
