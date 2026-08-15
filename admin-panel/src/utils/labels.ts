/** Backend enum değerlerinin Türkçe görüntüleme karşılıkları.
 *  Backend'e gönderilen/beklenen değerler değişmez — sadece görüntüleme katmanı. */

export const statusLabels: Record<string, string> = {
  OPEN: 'Açık',
  IN_PROGRESS: 'İşlemde',
  RESOLVED: 'Çözüldü',
  CLOSED: 'Kapalı',
};

export const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
};

/** Sözlükte yoksa orijinal değeri döndür (fallback). */
export const label = (map: Record<string, string>, value: string): string =>
  map[value] ?? value;
