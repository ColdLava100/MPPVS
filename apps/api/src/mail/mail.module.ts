import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller'; // <-- Import it

@Module({
  controllers: [MailController], // <-- Add it to the controllers array
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
