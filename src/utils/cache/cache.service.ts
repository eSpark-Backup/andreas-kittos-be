/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache: { [key: string]: any } = {};

  constructor() {}

  async setWithExpiration(key: string, value: any, expiresIn: number): Promise<void> {
    this.cache[key] = {
      value,
      expiresAt: Date.now() + expiresIn * 1000, 
    };
  }

  async get<T>(key: string): Promise<T | null> {
    const cachedItem = this.cache[key];
    if (cachedItem && cachedItem.expiresAt > Date.now()) {
        return cachedItem.value;
    } else {
        delete this.cache[key];
        return null;
    }
}

  async del(key: string): Promise<void> {
    delete this.cache[key];
  }

  async exists(key: string): Promise<boolean> {
    return !!this.cache[key] && this.cache[key].expiresAt > Date.now();
  }

  async flushall(): Promise<void> {
    this.cache = {};
  }
}
