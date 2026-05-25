# 🚀 Production Deployment Checklist

Sebelum deploy ke production, pastikan untuk menyelesaikan checklist berikut:

## 🔴 Auth & Security

### 1. Setup Google OAuth Credentials
- [ ] Buka [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Buat project baru (atau gunakan yang sudah ada)
- [ ] Enable Google+ API / Google Identity
- [ ] Create OAuth 2.0 Client ID (Web Application)
- [ ] Tambah authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
- [ ] Copy `Client ID` dan `Client Secret`

### 2. Update Environment Variables
Edit file `.env` (production server):

```bash
# Ganti dengan credentials asli dari Google Cloud Console
GOOGLE_CLIENT_ID="your-real-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-real-client-secret"

# Update production URL
NEXTAUTH_URL="https://yourdomain.com"

# Generate strong secret untuk JWT
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

**Cara generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Atau kunjungi: https://generate-secret.vercel.app/32
```

### 3. Disable or Delete Mock Login

**Option A: Hapus file**
```bash
rm src/app/api/dev-login/route.ts
rm src/components/dev-mock-login.tsx
rm src/contexts/dev-auth-context.tsx
rm src/lib/auth-helper.ts
```

**Option B: Uncomment production check**

Di `src/app/api/dev-login/route.ts`:
- Uncomment baris: `if (process.env.NODE_ENV === 'production') { ... }`

Di `src/components/dev-mock-login.tsx`:
- Komponen sudah auto-hide di production karena `isDevMode` check

### 4. Update Layout (Optional)
Jika menghapus mock login, hapus import dari `src/app/layout.tsx`:
```typescript
// Hapus baris ini:
import { DevAuthProvider } from "@/contexts/dev-auth-context";

// Hapus pembungkus ini:
<DevAuthProvider>
  {/* ... */}
</DevAuthProvider>
```

### 5. Update Forum Page (Optional)
Jika menghapus mock login, hapus import dan penggunaan dari `src/app/forum/page.tsx`:
```typescript
// Hapus import ini:
import { DevMockLogin } from '@/components/dev-mock-login'

// Hapus penggunaan komponen:
<DevMockLogin />
```

## 📦 Build & Deployment

### 1. Run Build Test
```bash
bun run build
```
Pastikan tidak ada error.

### 2. Lint Check
```bash
bun run lint
```
Pastikan tidak ada error.

### 3. Database Setup
- [ ] Setup production database (PostgreSQL/MySQL recommended)
- [ ] Update `DATABASE_URL` di `.env`
- [ ] Run migrations:
  ```bash
  bunx prisma migrate deploy
  ```
- [ ] Seed categories jika perlu:
  ```bash
  bun run prisma/seed-categories.ts
  ```

### 4. PWA Configuration
- [ ] Update `manifest.json` dengan domain production
- [ ] Update icons untuk production
- [ ] Verify service worker works on HTTPS

## 🔍 Pre-Production Testing

### Test Auth Flow
- [ ] Login dengan Google berhasil
- [ ] Super Admin (gtxsatria27@gmail.com) dapat akses `/admin`
- [ ] User biasa tidak dapat akses `/admin`
- [ ] Logout berfungsi

### Test Forum Features
- [ ] Membuat thread baru
- [ ] Upload gambar (compressed to 300KB)
- [ ] Membuat komentar/reply
- [ ] Vote thread dan komentar
- [ ] Filter by category
- [ ] Search thread

### Test Admin Features
- [ ] Akses dashboard admin
- [ ] Lihat list pendaftaran
- [ ] Download Excel/CSV
- [ ] Ban/unban user (jika fitur aktif)

### Test PWA
- [ ] Install as app di mobile
- [ ] Offline functionality (jika ada)
- [ ] Push notifications (jika ada)

## 🌐 Domain & SSL

- [ ] Setup domain (e.g., lpkkurnia.com)
- [ ] Setup SSL certificate (Let's Encrypt recommended)
- [ ] Update `NEXTAUTH_URL` dengan HTTPS

## 📝 Post-Deployment

- [ ] Monitor error logs
- [ ] Test semua fitur di production
- [ ] Setup backup database
- [ ] Setup monitoring (sentry, logrocket, dll)

---

## ⚠️ File yang Perlu Diubah untuk Production

### File Wajib Edit:
1. `.env` - Environment variables untuk production

### File Optional Edit/Hapus:
1. `src/app/api/dev-login/route.ts` - Mock login endpoint
2. `src/components/dev-mock-login.tsx` - Mock login UI
3. `src/contexts/dev-auth-context.tsx` - Mock auth context
4. `src/lib/auth-helper.ts` - Auth helper untuk mock session

### File dengan Komentar Production:
1. `src/lib/auth.ts` - Sudah memiliki komentar production requirements
2. `src/app/api/dev-login/route.ts` - Sudah memiliki komentar disable instructions

---

## 📞 Bantuan

Jika mengalami masalah saat deployment:

1. Cek logs: `tail -f dev.log` atau production logs
2. Verify environment variables: `echo $NEXTAUTH_SECRET`
3. Check database connection
4. Verify Google OAuth redirect URI
5. Clear cache dan rebuild: `rm -rf .next && bun run build`

---

**Last Updated:** 2025
**Version:** 1.0
