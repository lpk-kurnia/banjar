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
import { LogOut, User, Settings, Mail, Github, Loader2 } from 'lucide-react'

export function AuthButton() {
  const { user, status, signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail, signOut } = useAuth()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-800 hover:bg-blue-600 text-white">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Masuk</span>
              <span className="text-xs opacity-90">Google / GitHub / Email</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-blue-950 border-blue-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Masuk ke Forum KurniaTech</DialogTitle>
            <DialogDescription className="text-white">
              Pilih metode login yang Anda inginkan
            </DialogDescription>
          </DialogHeader>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full bg-white text-gray-800 hover:bg-gray-100 border-gray-300 h-12"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </Button>

            <Button
              onClick={signInWithGitHub}
              variant="outline"
              className="w-full bg-gray-900 text-white hover:bg-gray-800 border-gray-700 h-12"
            >
              <Github className="w-5 h-5 mr-3" />
              Masuk dengan GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-blue-950 px-2 text-white">atau</span>
              </div>
            </div>

            {/* Email/Password Tabs */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-900/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-blue-600 text-white">Daftar</TabsTrigger>
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
                    className="bg-blue-900/50 border-blue-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-blue-900/50 border-blue-700 text-white"
                  />
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
                  Login dengan Email
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
                    className="bg-blue-900/50 border-blue-700 text-white"
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
                    className="bg-blue-900/50 border-blue-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">Password (min. 6 karakter)</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="bg-blue-900/50 border-blue-700 text-white"
                  />
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
                      setAuthDialogOpen(false)
                    }
                    setIsLoading(false)
                  }}
                  disabled={isLoading || !registerName || !registerEmail || !registerPassword}
                  className="w-full bg-blue-800 hover:bg-blue-600 text-white"
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Mail className="w-4 h-4 mr-2" />
                  Daftar dengan Email
                </Button>
              </TabsContent>
            </Tabs>
          </div>
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
