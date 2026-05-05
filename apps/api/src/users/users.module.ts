import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuditLogsModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
