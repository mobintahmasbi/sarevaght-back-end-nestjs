import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [InteractionService],
  exports: [InteractionService],
})
export class InteractionModule {}
