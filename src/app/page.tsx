'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Cpu, HardDrive, GraduationCap, Users, CheckCircle2, ArrowRight, MapPin, Phone, Mail, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    program: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', whatsapp: '', address: '', program: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-950/95 backdrop-blur-sm border-b border-blue-800">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="LPK Kurnia Logo" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-white">LPK Kurnia</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 hover:bg-blue-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icon-192x192.png" alt="LPK Kurnia Logo" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-white">LPK Kurnia</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#about" className="text-white hover:text-blue-100 transition-colors">Tentang</a>
              <a href="#programs" className="text-white hover:text-blue-100 transition-colors">Program</a>
              <a href="#register" className="text-white hover:text-blue-100 transition-colors">Daftar</a>
              <Button asChild className="bg-blue-800 hover:bg-blue-600 text-white">
                <a href="/forum">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Forum
                </a>
              </Button>
              <Button asChild className="bg-blue-800 hover:bg-blue-600 text-white">
                <a href="/admin">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </a>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-blue-800 pt-4 space-y-3">
              <div className="text-white font-semibold mb-2">
                <Menu className="w-4 h-4 inline mr-2" />
                Menu
              </div>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-blue-100 transition-colors py-2">Tentang</a>
              <a href="#programs" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-blue-100 transition-colors py-2">Program</a>
              <a href="#register" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-blue-100 transition-colors py-2">Daftar</a>
              <Button asChild className="w-full bg-blue-800 hover:bg-blue-600 text-white">
                <a href="/forum" onClick={() => setIsMenuOpen(false)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Forum
                </a>
              </Button>
              <Button asChild className="w-full bg-blue-800 hover:bg-blue-600 text-white">
                <a href="/admin" onClick={() => setIsMenuOpen(false)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </a>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-blue-800 text-blue-100 border-blue-700">
            Pendaftaran GRATIS
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ilmu Komputer Gratis di
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}LPK Kurnia
            </span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Dapatkan keahlian hardware dan software komputer yang komprehensif.
            Bergabung dengan komunitas belajar dan forum diskusi aktif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-800 hover:bg-blue-600 text-white">
              <a href="#register">
                Daftar Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" className="bg-blue-800 hover:bg-blue-600 text-white">
              <a href="/forum">
                <MessageSquare className="w-4 h-4 mr-2" />
                Join Forum
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-white text-sm">Siswa Terdaftar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">2</div>
              <div className="text-white text-sm">Program Unggulan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-white text-sm">Gratis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-white text-sm">Forum Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-blue-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tentang LPK Kurnia
            </h2>
            <p className="text-white max-w-2xl mx-auto">
              LPK Kurnia hadir untuk memberikan pelatihan komputer berkualitas secara GRATIS
              bagi generasi muda yang ingin mendalami dunia teknologi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-blue-950/50 border-blue-800">
              <CardHeader>
                <GraduationCap className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-white">Pengajar Berpengalaman</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white">
                  Diajar oleh praktisi yang berpengalaman di bidang hardware dan software komputer.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-blue-950/50 border-blue-800">
              <CardHeader>
                <Users className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-white">Komunitas Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white">
                  Bergabung dengan forum diskusi aktif untuk berbagi ilmu dan pengalaman.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-blue-950/50 border-blue-800">
              <CardHeader>
                <CheckCircle2 className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-white">Sertifikat Gratis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white">
                  Dapatkan sertifikat resmi setelah menyelesaikan program pelatihan.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Program Pelatihan
            </h2>
            <p className="text-white max-w-2xl mx-auto">
              Pilih program yang sesuai dengan minat dan kebutuhan karir Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-800 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl">Hardware</CardTitle>
                <CardDescription className="text-white">
                  Pelajari perakitan, perbaikan, dan maintenance komputer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-white">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Rakit PC dari nol</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Troubleshooting hardware</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Upgrade komponen PC</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Installasi driver & BIOS</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-800 rounded-lg flex items-center justify-center mb-4">
                  <HardDrive className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl">Software</CardTitle>
                <CardDescription className="text-white">
                  Kuasai sistem operasi, aplikasi, dan pemrograman dasar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-white">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Instalasi Windows & Linux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Microsoft Office & produktivitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Optimasi sistem & security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Pemrograman dasar</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="register" className="py-20 px-4 bg-blue-900/50">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Daftar Sekarang - GRATIS
            </h2>
            <p className="text-white">
              Isi formulir di bawah ini untuk mendaftar program pelatihan.
            </p>
          </div>

          <Card className="bg-blue-950/50 border-blue-800">
            <CardHeader>
              <CardTitle className="text-white">Formulir Pendaftaran</CardTitle>
              <CardDescription className="text-white">
                Data Anda akan aman dan hanya digunakan untuk keperluan pendaftaran LPK Kurnia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nama Lengkap</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
                    placeholder="email@contoh.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-white">No WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Alamat</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400 min-h-[80px]"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program" className="text-white">Program yang Diminati</Label>
                  <select
                    id="program"
                    required
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-3 py-2 bg-blue-900/50 border border-blue-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih program</option>
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="both">Keduanya (Hardware + Software)</option>
                  </select>
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                    <p className="text-green-300 text-center">
                      ✓ Pendaftaran berhasil! Kami akan menghubungi Anda segera.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-center">
                      Terjadi kesalahan. Silakan coba lagi.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-800 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? 'Mengirim...' : 'Daftar Sekarang'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 border-t border-blue-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon-192x192.png" alt="LPK Kurnia Logo" className="w-10 h-10 rounded-lg" />
                <span className="text-xl font-bold text-white">LPK Kurnia</span>
              </div>
              <p className="text-white text-sm">
                lembaga pendidikan non-formal di Kota Banjar yang berfokus pada pelatihan keterampilan kerja, khususnya di bidang teknologi informasi dan aplikasi perkantoran secara gratis.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-white text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Jl. Tentara Pelajar No. 25, Sumanding, Kota Banjar, Jawa Barat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(0265) 2732082</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>lpkkurnia@outlook.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Link Cepat</h3>
              <ul className="space-y-2 text-white text-sm">
                <li>
                  <a href="#about" className="hover:text-blue-100 transition-colors">Tentang Kami</a>
                </li>
                <li>
                  <a href="#programs" className="hover:text-blue-100 transition-colors">Program</a>
                </li>
                <li>
                  <a href="#register" className="hover:text-blue-100 transition-colors">Daftar</a>
                </li>
                <li>
                  <a href="/forum" className="hover:text-blue-100 transition-colors">Forum</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 pt-8 text-center">
            <p className="text-white text-sm">
              © {new Date().getFullYear()} LPK Kurnia. By GTX Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
