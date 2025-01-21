import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/business/guards/authentication.guard';
import { SupportService } from './support.service';
import { CreateSupportDto } from './DTO/create-support.dto';

@Controller('support')
export class SupportController{
    constructor(private readonly supportService: SupportService) {}

    @Post('create')
    @UseGuards(AuthGuard)
    async createSupport(@Body() createSupportDto: CreateSupportDto) {
        return this.supportService.createSupport(createSupportDto)
    }
}