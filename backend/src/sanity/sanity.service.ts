import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SanityClient } from '@sanity/client';

@Injectable()
export class SanityService implements OnModuleInit {
  private readonly logger = new Logger(SanityService.name);
  private client: SanityClient | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.config.get<string>('SANITY_PROJECT_ID');
    const dataset = this.config.get<string>('SANITY_DATASET') ?? 'production';

    if (!projectId) {
      this.logger.warn('SANITY_PROJECT_ID is not set, falling back to the bundled product seed');
      return;
    }

    this.client = createClient({
      projectId,
      dataset,
      apiVersion: this.config.get<string>('SANITY_API_VERSION') ?? '2024-01-01',
      token: this.config.get<string>('SANITY_TOKEN'),
      useCdn: this.config.get<string>('SANITY_USE_CDN') !== 'false',
      perspective: 'published',
    });

    this.logger.log(`Sanity client ready for project ${projectId} (dataset: ${dataset})`);
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  async fetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
    if (!this.client) return null;

    try {
      return await this.client.fetch<T>(query, params);
    } catch (error) {
      this.logger.error(`Sanity query failed: ${(error as Error).message}`);
      return null;
    }
  }
}
