import { Ticket } from '../types/ticket';

export const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Yazıcı çalışmıyor',
    description: '3. kattaki ofis yazıcısı sabahtan beri baskı almıyor. Birden fazla bilgisayardan denendi, sorun devam ediyor.',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-08-19',
  },
  {
    id: '2',
    title: 'Uygulama açılmıyor',
    description: 'Muhasebe uygulaması güncellemeden sonra başlatılamıyor. Uygulama logo ekranında takılı kalıyor ve kapanıyor.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-18',
  },
  {
    id: '3',
    title: 'Şifremi unuttum',
    description: 'Kurumsal e-posta hesabı şifremi sıfırlamam gerekiyor. Sıfırlama maili gelmedi, spam klasörü de kontrol edildi.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2026-08-15',
  },
  {
    id: '4',
    title: 'Ekran donuyor',
    description: 'Video konferans sırasında ekran birkaç dakikada bir donuyor. Sorun özellikle ekran paylaşımı yapılırken ortaya çıkıyor.',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdAt: '2026-08-17',
  },
  {
    id: '5',
    title: 'Yeni özellik talebi',
    description: 'Raporlama ekranına tarih filtresi eklenmesi talep ediyorum. Aylık bazda filtreleme yapılabilirse işlemler çok kolaylaşacak.',
    priority: 'LOW',
    status: 'CLOSED',
    createdAt: '2026-08-10',
  },
  {
    id: '6',
    title: 'VPN bağlantısı kopuyor',
    description: 'Uzaktan çalışırken VPN her 30 dakikada bir düşüyor. Yeniden bağlanmak zorunda kalınca açık oturumlar kapanıyor.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-20',
  },
];
