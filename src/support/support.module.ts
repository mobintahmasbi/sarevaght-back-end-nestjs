import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Support, SupportSchema } from "./schema/support.schema";
import { BusinessModule } from "src/business/business.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: Support.name, schema: SupportSchema}]), BusinessModule, AuthModule],
    controllers: [],
    providers: []
})
export class SupportModule{}