# Destek Sistemi — Backend

NestJS tabanlı müşteri destek bileti yönetim sistemi REST API'si.

## Gereksinimler

- Node.js (v18+)
- MySQL (v8+)

## Kurulum

1. Repoyu klonla: `git clone <repo-url> && cd backend`
2. Bağımlılıkları yükle: `npm install`
3. `.env` dosyasını oluştur ve düzenle (örnek: `.env.example`)
4. Migration'ları çalıştır: `npm run migration:run`
5. Sunucuyu başlat: `npm run start:dev`

## .env Örneği

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_DATABASE=destek_sistemi
JWT_SECRET=your_jwt_secret
```

## Test Endpoint'leri

```
POST   /auth/register
POST   /auth/login
GET    /auth/me

POST   /tickets
GET    /tickets
GET    /tickets/:id
PATCH  /tickets/:id
```

> `/auth/me` ve ticket endpoint'leri için `Authorization: Bearer <token>` header'ı gereklidir.
