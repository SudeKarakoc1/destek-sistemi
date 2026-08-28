# Destek Sistemi — Admin Panel

Adminlerin destek biletlerini yönettiği, AI destekli özet ve çözüm önerisi üretebildiği React + Vite tabanlı web paneli.

## Özellikler

- Tüm biletleri listeleme ve filtreleme
- Bilet durumu güncelleme
- AI ile bilet özeti çıkarma (yalnızca admin)
- AI ile çözüm önerisi üretme (yalnızca admin, üretilen öneri mobilden de görüntülenebilir)
- Bilet üzerinde kullanıcıyla karşılıklı yorum/yazışma (Yorumlar bölümü)

## Kurulum

```bash
npm install
```

## Ortam Değişkeni

API URL'i `src/services/api.ts` dosyasında `import.meta.env.VITE_API_URL` üzerinden okunur. Çalıştırmadan önce proje kökünde bir `.env` dosyası oluştur:

```env
VITE_API_URL=http://localhost:3000
```

## Çalıştırma

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

## Klasör Yapısı

```
src/
├── components/ — Paylaşılan bileşenler
│   ├── CommentSection.tsx  — Bilet yorum/yazışma bileşeni (admin ↔ kullanıcı)
│   └── ConfirmDialog.tsx   — Onay diyaloğu bileşeni
├── pages/      — Sayfa bileşenleri (Login, Dashboard, TicketDetail, …)
├── services/   — API istemcisi (axios, token interceptor)
└── utils/      — Yardımcı fonksiyonlar
```
