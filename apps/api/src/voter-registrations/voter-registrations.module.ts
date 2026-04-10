import { Module } from '@nestjs/common';
import { VoterRegistrationsController } from './voter-registrations.controller';
import { VoterRegistrationsService } from './voter-registrations.service';

@Module({
  controllers: [VoterRegistrationsController],
  providers: [VoterRegistrationsService],
  exports: [VoterRegistrationsService],
})
export class VoterRegistrationsModule {}
