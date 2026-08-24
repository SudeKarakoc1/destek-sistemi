/** Backend'den gelen bilinen İngilizce hata mesajlarının Türkçe karşılıkları */
const ERROR_TRANSLATIONS: Record<string, string> = {
  'currentPassword should not be empty': 'Mevcut şifre boş bırakılamaz.',
  'email must be an email': 'Lütfen geçerli bir email adresi girin.',
  'email should not be empty': 'Email boş bırakılamaz.',
  'name must be longer than or equal to 2 characters': 'Ad Soyad en az 2 karakter olmalı.',
  'name should not be empty': 'Ad Soyad boş bırakılamaz.',
  'newPassword must be longer than or equal to 6 characters': 'Yeni şifre en az 6 karakter olmalı.',
  'newPassword should not be empty': 'Yeni şifre boş bırakılamaz.',
  'password must be longer than or equal to 6 characters': 'Şifre en az 6 karakter olmalı.',
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
