import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

class WorkTimeShift{
    
    @IsString()
    morning: string

    @IsString()
    afternoon: string
}

export class SetBusinessWorkTimesDto{
    
    @ValidateNested()
    @Type(() => WorkTimeShift)
    Monday: WorkTimeShift 

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Tuesday: WorkTimeShift 

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Wednesday: WorkTimeShift 

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Thursday: WorkTimeShift 

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Friday: WorkTimeShift 

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Saturday: WorkTimeShift 

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Sunday: WorkTimeShift

    @ValidateNested()
    @Type(() => WorkTimeShift)
    Weekend: WorkTimeShift
    
    @IsString()
    token: string
}