/** Backend'den gelen bilinen İngilizce hata mesajlarının Türkçe karşılıkları */
const ERROR_TRANSLATIONS: Record<string, string> = {
  'password must be longer than or equal to 6 characters': 'Şifre en az 6 karakter olmalı.',
  'email must be an email': 'Lütfen geçerli bir email adresi girin.',
  'name should not be empty': 'Ad Soyad boş bırakılamaz.',
  'email should not be empty': 'Email boş bırakılamaz.',
  'password should not be empty': 'Şifre boş bırakılamaz.',
};

/**
 * Tek bir hata mesajını Türkçeye çevirir.
 * Sözlükte bulunamazsa orijinal mesajı döndürür.
 */
function translateSingle(message: string): string {
  return ERROR_TRANSLATIONS[message] ?? message;
}

/**
 * Backend'den gelen hata mesajını (string veya string[]) Türkçeye çevirir.
 * NestJS ValidationPipe birden fazla hata döndürebilir; bu durumda
 * her biri ayrı ayrı çevirilip virgülle birleştirilir.
 */
export function translateErrorMessage(message: string | string[]): string {
  if (Array.isArray(message)) {
    return message.map(translateSingle).join(', ');
  }
  return translateSingle(message);
}
