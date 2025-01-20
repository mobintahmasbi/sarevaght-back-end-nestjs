import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Support, SupportSchema } from "./schema/support.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Support.name, schema: SupportSchema}])],
    controllers: [],
    providers: []
})
export class SupportModule{}