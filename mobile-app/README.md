# Destek Sistemi — Mobile App

Kullanıcıların destek bileti oluşturup takip edebildiği, AI'dan kategori ve öncelik önerisi alabildiği React Native + Expo tabanlı mobil uygulama.

## Özellikler

- Destek bileti oluşturma ve listeleme
- Bilet detayını görüntüleme ve takip etme
- AI destekli kategori ve öncelik önerisi alma
- Admin tarafından üretilen AI çözüm önerisini görüntüleme
- Bilet üzerinde admin ile karşılıklı yorum/yazışma (Yorumlar bölümü)

## Kurulum

```bash
npm install
```

## Ortam Değişkeni

API URL'i `EXPO_PUBLIC_API_URL` değişkeni üzerinden okunur. Proje kökünde (mobile-app/) bir `.env` dosyası oluştur:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

> **Not:** `10.0.2.2`, Android emülatöründen host makinesine erişim için kullanılan özel IP adresidir. Gerçek cihazda test ediyorsan bilgisayarının yerel IP adresini kullan (ör. `http://192.168.1.x:3000`).

## Çalıştırma

```bash
npx expo start
```

Expo Go uygulamasını yükleyerek terminaldeki QR kodu okutabilir ya da Android/iOS emülatörü üzerinde çalıştırabilirsin.

## Klasör Yapısı

```
src/
├── screens/    — Ekran bileşenleri (Login, Home, TicketDetail, …)
├── components/ — Paylaşılan bileşenler
│   ├── CommentSection.tsx      — Bilet yorum/yazışma bileşeni (kullanıcı ↔ admin)
│   └── CommentActionModal.tsx  — Yorum düzenleme/silme aksiyon modalı
├── navigation/ — Stack / Tab navigasyon yapılandırması
├── context/    — Global state (ThemeContext, AuthContext, …)
├── services/   — API istemcisi (axios)
├── types/      — TypeScript tip tanımları (Ticket, User, …)
└── utils/      — Yardımcı fonksiyonlar
```
