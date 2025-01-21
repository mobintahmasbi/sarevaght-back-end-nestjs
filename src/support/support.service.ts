import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Support } from "./schema/support.schema";
import { Model } from "mongoose";
import { CreateSupportDto } from "./DTO/create-support.dto";
import { AuthService } from "src/auth/auth.service";
import { supportStatus } from "./schema/support-status.enum";

@Injectable()
export class SupportService{
    constructor(
        @InjectModel(Support.name) private supportModel: Model<Support>,
        private readonly authService: AuthService
    ){}

    async createSupport(createSupportDto: CreateSupportDto) {
        const { phoneNumber } = this.authService.decodeToken(createSupportDto.token)
        try {
            await this.supportModel.create({
                title: createSupportDto.title,
                description: createSupportDto.description,
                status: supportStatus.ACTIVE,
                phoneNumber,
                createdAt: Date.now()
            })
            return {
                message: 'support create sucessfully and will be answered as soon as possible.',
                status: true
            }
        } catch (error) {
            console.error(error.message)
            return new InternalServerErrorException()
        }
    }
}