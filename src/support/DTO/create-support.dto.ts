import { IsString } from 'class-validator';

export class CreateSupportDto {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsString()
    token: string
}