import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

// Sabit listeler — AI'nın dışına çıkmaması gereken değerler
const VALID_CATEGORIES = [
  'Donanım',
  'Yazılım',
  'Ağ/Bağlantı',
  'Hesap/Şifre',
  'Diğer',
] as const;

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

type Category = (typeof VALID_CATEGORIES)[number];
type Priority = (typeof VALID_PRIORITIES)[number];

export interface SuggestionResult {
  category: Category;
  priority: Priority;
}

// OpenAI JSON çıktısını güvenli şekilde daraltmak için type guard
function isSuggestionShape(
  value: unknown,
): value is { category: unknown; priority: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'category' in value &&
    'priority' in value
  );
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant for a technical support ticket system.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;

      if (content === null || content === undefined) {
        throw new InternalServerErrorException(
          'OpenAI returned an empty response.',
        );
      }

      return content;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      console.error('OpenAI API error:', error);
      throw new InternalServerErrorException(
        'An error occurred while communicating with the AI service.',
      );
    }
  }

  /**
   * Verilen başlık ve açıklamaya göre kategori ve öncelik önerisinde bulunur.
   * Hata durumunda exception fırlatmak yerine güvenli varsayılana düşer.
   */
  async suggestCategoryAndPriority(
    title: string,
    description: string,
  ): Promise<SuggestionResult> {
    const fallback: SuggestionResult = { category: 'Diğer', priority: 'MEDIUM' };

    const systemMessage = `
Sen bir IT destek talebi sınıflandırma asistanısın.
Kullanıcının verdiği başlık ve açıklamaya göre aşağıdaki listelerden tam olarak birer değer seç:

Kategori seçenekleri (sadece bu değerlerden biri):
- "Donanım"
- "Yazılım"
- "Ağ/Bağlantı"
- "Hesap/Şifre"
- "Diğer"

Öncelik seçenekleri (sadece bu değerlerden biri):
- "LOW"    (düşük aciliyet — genel bilgi, küçük sorunlar)
- "MEDIUM" (orta aciliyet — günlük işi etkiliyor ama çalışma devam ediyor)
- "HIGH"   (yüksek aciliyet — çalışma tamamen durdu, kritik sistem)

Sadece şu anahtarları içeren geçerli JSON döndür, başka hiçbir şey ekleme:
{"category": "<kategori>", "priority": "<öncelik>"}
`.trim();

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemMessage },
          {
            role: 'user',
            content: `Başlık: ${title}\nAçıklama: ${description}`,
          },
        ],
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) {
        console.error('suggestCategoryAndPriority: OpenAI boş yanıt döndürdü');
        return fallback;
      }

      const parsed: unknown = JSON.parse(raw);

      if (!isSuggestionShape(parsed)) {
        console.error('suggestCategoryAndPriority: Beklenmedik JSON yapısı', parsed);
        return fallback;
      }

      const category = VALID_CATEGORIES.includes(parsed.category as Category)
        ? (parsed.category as Category)
        : 'Diğer';

      const priority = VALID_PRIORITIES.includes(parsed.priority as Priority)
        ? (parsed.priority as Priority)
        : 'MEDIUM';

      return { category, priority };
    } catch (error) {
      console.error('suggestCategoryAndPriority hatası:', error);
      return fallback;
    }
  }

  /**
   * Ticket başlığı ve açıklamasından kısa Türkçe özet üretir.
   * Hata yönetimi generateCompletion tarafından yapılır (InternalServerErrorException).
   */
  async summarizeTicket(title: string, description: string): Promise<string> {
    const prompt = `Aşağıdaki IT destek talebini Türkçe olarak 2-3 cümleyle özetle. \
Teknik detayları koru, sade ve anlaşılır bir dil kullan. Yalnızca özet metnini yaz, başka bir şey ekleme.

Başlık: ${title}
Açıklama: ${description}`;

    return this.generateCompletion(prompt);
  }

  /**
   * Ticket başlığı, açıklaması ve kategorisine göre admin için adım adım
   * Türkçe çözüm önerisi üretir.
   * Hata yönetimi generateCompletion tarafından yapılır (InternalServerErrorException).
   */
  async suggestSolution(
    title: string,
    description: string,
    category: string,
  ): Promise<string> {
    const prompt = `Sen bir IT destek uzmanısın. Aşağıdaki destek talebini incele ve bu talebi çözecek adminin \
uygulayacağı adımları Türkçe olarak yaz.

Kategori: ${category}
Başlık: ${title}
Açıklama: ${description}

Gereksinimlerin:
- 3 ile 5 arasında numaralandırılmış adım yaz (1. ... 2. ... formatında düz metin).
- Teknik detay içerebilir, hedef kitle son kullanıcı değil admindir.
- Markdown, JSON veya başka format kullanma; yalnızca numaralı adım listesini yaz.`;

    return this.generateCompletion(prompt);
  }
}
