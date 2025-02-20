export interface ICacheService {
    get(key: string): Promise<any | undefined>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
}