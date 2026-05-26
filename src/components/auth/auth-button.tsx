'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, User, Settings, Mail, Loader2, Eye, EyeOff, LogIn, CheckCircle2 } from 'lucide-react'

export function AuthButton() {
  const { user, status, signInWithEmail, signUpWithEmail, signOut } = useAuth()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false)

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <Dialog open={authDialogOpen} onOpenChange={(open) => {
        setAuthDialogOpen(open)
        if (!open) {
          setAuthError('')
          setLoginEmail('')
          setLoginPassword('')
          setRegisterName('')
          setRegisterEmail('')
          setRegisterPassword('')
          setShowRegisterSuccess(false)
          setActiveTab('login')
        }
      }}>
        <DialogTrigger asChild>
          <Button className="bg-blue-800 hover:bg-blue-600 text-white">
            <LogIn className="w-5 h-5 mr-2" />
            <span className="font-semibold">Masuk</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-blue-950 border-blue-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Forum KurniaTech</DialogTitle>
            <DialogDescription className="text-white/70 text-center text-sm">
              Masuk atau daftar untuk bergabung
            </DialogDescription>
          </DialogHeader>

          {showRegisterSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Akun Berhasil Dibuat!</h3>
              <p className="text-white/70 text-sm">
                Silakan login dengan email dan password yang sudah didaftarkan.
              </p>
              <Button
                onClick={() => {
                  setShowRegisterSuccess(false)
                  setActiveTab('login')
                  setLoginEmail(registerEmail)
                  setRegisterName('')
                  setRegisterEmail('')
                  setRegisterPassword('')
                }}
                className="bg-blue-800 hover:bg-blue-600 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login Sekarang
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-900/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-blue-600 text-white">Daftar LPK</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-blue-900/50 border-blue-700 text-white placeholder:text-white/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {authError && (
                  <p className="text-red-400 text-sm">{authError}</p>
                )}
                <Button
                  onClick={async () => {
                    setIsLoading(true)
                    setAuthError('')
                    const { error } = await signInWithEmail(loginEmail, loginPassword)
                    if (error) {
                      setAuthError(error)
                    } else {
                      setAuthDialogOpen(false)
                    }
                    setIsLoading(false)
                  }}
                  disabled={isLoading || !loginEmail || !loginPassword}
                  className="w-full bg-blue-800 hover:bg-blue-600 text-white"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Mail className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-white">Nama</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nama lengkap"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-blue-900/50 border-blue-700 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">Password (min. 6 karakter)</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-blue-900/50 border-blue-700 text-white placeholder:text-white/40 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {authError && (
                  <p className="text-red-400 text-sm">{authError}</p>
                )}
                <Button
                  onClick={async () => {
                    setIsLoading(true)
                    setAuthError('')
                    const { error } = await signUpWithEmail(registerEmail, registerPassword, registerName)
                    if (error) {
                      setAuthError(error)
                    } else {
                      setShowRegisterSuccess(true)
                    }
                    setIsLoading(false)
                  }}
                  disabled={isLoading || !registerName || !registerEmail || !registerPassword}
                  className="w-full bg-blue-800 hover:bg-blue-600 text-white"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Mail className="w-4 h-4 mr-2" />
                  Daftar LPK
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  // Cek jika user dibanned
  if (user.isBanned) {
    return (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-red-400">Akun di-suspend</span>
        <Button variant="outline" onClick={signOut} className="border-blue-600 text-white">
          Logout
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-white/70">
              {user.email}
            </p>
            <p className="text-xs leading-none text-white/70 mt-1">
              Role: {user.role === 'SUPER_ADMIN' ? 'Admin' : 'User'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Pengaturan</span>
        </DropdownMenuItem>
        {user.role === 'SUPER_ADMIN' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Dashboard Admin</span>
              </a>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
