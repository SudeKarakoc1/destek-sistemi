# 🛠️ Destek Sistemi — Backend

NestJS, Prisma ve MySQL kullanılarak geliştirilmiş destek talebi (ticket) yönetim sistemi backend'i.

---

## 📋 Gereksinimler

Başlamadan önce aşağıdakilerin kurulu olduğundan emin olun:

| Araç | Minimum Sürüm | İndirme |
|------|--------------|---------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Node.js ile birlikte gelir |
| MySQL | v8+ | https://dev.mysql.com/downloads/ |

---

## 🚀 Adım Adım Kurulum

### 1. Repoyu klonlayın

```bash
git clone <repo-url>
cd destek-sistemi/backend
```

---

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

---

### 3. `.env` dosyasını oluşturun

Proje kök dizinindeki `.env.example` dosyasını kopyalayarak `.env` oluşturun:

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Ardından `.env` dosyasını kendi ortamınıza göre düzenleyin:

```env
# MySQL bağlantı dizesi
DATABASE_URL="mysql://root:your_password@localhost:3306/destek_sistemi"

# Uygulama portu
PORT=3000

# Ortam
NODE_ENV=development

# JWT imzalama anahtarı (üretimde güçlü bir değer kullanın)
JWT_SECRET="super-secret-change-this-in-production"

# JWT token geçerlilik süresi
JWT_EXPIRES_IN="7d"
```

> **Not:** `DATABASE_URL` içindeki `your_password` kısmını MySQL kullanıcınızın gerçek şifresiyle değiştirin.

---

### 4. MySQL veritabanını oluşturun

MySQL'e bağlanıp veritabanını oluşturun:

```sql
CREATE DATABASE destek_sistemi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 5. Prisma migration'larını çalıştırın

Veritabanı tablolarını oluşturmak için migration'ları uygulayın:

```bash
npm run prisma:migrate
```

> Bu komut, `prisma/migrations/` klasöründeki tüm migration'ları sırayla çalıştırır ve `@prisma/client`'ı otomatik olarak generate eder.

Sadece Prisma client'ı yeniden oluşturmak istiyorsanız:

```bash
npm run prisma:generate
```

---

### 6. Uygulamayı başlatın

**Geliştirme modu** (hot-reload ile):

```bash
npm run start:dev
```

**Normal başlatma:**

```bash
npm run start
```

**Production build & başlatma:**

```bash
npm run build
npm run start:prod
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

---

## 🗂️ Veritabanı Şeması

```
users
  └── id, name, email, passwordHash, role (USER | ADMIN | SUPPORT), createdAt

tickets
  └── id, userId (FK), title, description, status (OPEN | IN_PROGRESS | RESOLVED | CLOSED),
       category, priority (LOW | MEDIUM | HIGH), createdAt, updatedAt
```

---

## 🔧 Faydalı Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run start:dev` | Geliştirme modunda başlat (hot-reload) |
| `npm run start:prod` | Production modunda başlat |
| `npm run build` | TypeScript build al |
| `npm run prisma:migrate` | Migration'ları çalıştır |
| `npm run prisma:generate` | Prisma client'ı yeniden oluştur |
| `npm run prisma:studio` | Prisma Studio'yu aç (görsel DB yönetimi) |
| `npm run prisma:push` | Schema'yı migration olmadan DB'ye push et |
| `npm run lint` | ESLint ile kod kalitesini kontrol et |
| `npm run test` | Birim testlerini çalıştır |
| `npm run test:e2e` | E2E testleri çalıştır |

---

## 📁 Proje Yapısı

```
backend/
├── prisma/
│   ├── schema.prisma        # Veritabanı modelleri
│   └── migrations/          # Migration dosyaları
├── src/
│   ├── auth/                # JWT kimlik doğrulama
│   ├── tickets/             # Ticket CRUD işlemleri
│   ├── prisma/              # Prisma servisi
│   └── common/              # Shared decorator'lar, guard'lar
├── .env.example             # Örnek ortam değişkenleri
└── package.json
```

---

## ⚠️ Sık Karşılaşılan Sorunlar

**`P1001: Can't reach database server` hatası**
→ MySQL servisinin çalıştığından ve `DATABASE_URL`'deki şifre/port bilgilerinin doğru olduğundan emin olun.

**`@prisma/client did not initialize` hatası**
→ `npm run prisma:generate` komutunu çalıştırın.

**Port zaten kullanımda hatası**
→ `.env` dosyasındaki `PORT` değerini değiştirin veya ilgili portu kullanan işlemi sonlandırın.
