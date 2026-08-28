# Destek Sistemi — Backend

NestJS + Prisma tabanlı müşteri destek bileti yönetim sistemi REST API'si. JWT kimlik doğrulama, rol tabanlı erişim kontrolü ve OpenAI entegrasyonu içerir.

## Gereksinimler

- Node.js (v18+)
- MySQL (v8+)

## Kurulum

1. Bağımlılıkları yükle: `npm install`
2. `.env.example` dosyasını kopyala ve değerleri doldur:
   ```bash
   cp .env.example .env
   ```
3. Prisma istemcisini oluştur: `npm run prisma:generate`
4. Migration'ları çalıştır: `npm run prisma:migrate`
5. Sunucuyu başlat: `npm run start:dev`

## .env Örneği

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/destek_sistemi"
PORT=3000
NODE_ENV=development
JWT_SECRET="super-secret-change-this-in-production"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-..."
```

## Prisma Komutları

| Komut | Açıklama |
|---|---|
| `npm run prisma:generate` | Prisma istemcisini oluşturur |
| `npm run prisma:migrate` | Migration'ları çalıştırır (`prisma migrate dev`) |
| `npm run prisma:push` | Şemayı direkt DB'ye iter (geliştirme için) |
| `npm run prisma:studio` | Prisma Studio'yu açar |

## API Endpoint'leri

### Kimlik Doğrulama

```
POST   /auth/register   — Yeni kullanıcı kaydı
POST   /auth/login      — Giriş, JWT token döner
GET    /auth/me         — Oturum açmış kullanıcı bilgisi  [JWT gerekli]
```

### Biletler (Tickets)

```
POST   /tickets         — Yeni bilet oluştur              [JWT gerekli]
GET    /tickets         — Bilet listesi                   [JWT gerekli]
GET    /tickets/:id     — Bilet detayı                    [JWT gerekli]
PATCH  /tickets/:id     — Bilet güncelle                  [JWT gerekli]
```

### AI Entegrasyonu

```
POST   /tickets/ai/suggest          — Bilet başlık/açıklamasına göre kategori ve öncelik önerisi   [JWT gerekli]
POST   /tickets/:id/ai-summary      — Bilet için AI özeti üretir    [JWT gerekli, ADMIN]
POST   /tickets/:id/ai-solution     — Bilet için AI çözüm önerisi   [JWT gerekli, ADMIN]
```

> **Not:** `[JWT gerekli]` olan endpoint'lerde `Authorization: Bearer <token>` header'ı gönderilmelidir.
> `[ADMIN]` olarak işaretlenen endpoint'lere yalnızca admin rolüne sahip kullanıcılar erişebilir.
