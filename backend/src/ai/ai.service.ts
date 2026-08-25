import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
}
