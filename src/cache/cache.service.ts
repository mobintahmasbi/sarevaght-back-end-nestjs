import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICacheService } from './interfaces/cache-service.interface';

@Injectable()
export class CacheService implements ICacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
    
  async get(key: string): Promise<any | undefined> {
    return this.cacheManager.get(key);
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
      await this.cacheManager.clear()
  }
}

