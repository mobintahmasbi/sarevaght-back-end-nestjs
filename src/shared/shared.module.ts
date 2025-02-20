import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "src/cache/cache.service";

@Module({
    imports: [CacheModule.register({
        isGlobal: true
    })],
    providers: [CacheService],
    exports: [CacheService]
})
export class SharedModule{}