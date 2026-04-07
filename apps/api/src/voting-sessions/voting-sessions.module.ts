import { Module } from '@nestjs/common';
import { VotingSessionsController } from './voting-sessions.controller';
import { VotingSessionsService } from './voting-sessions.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [VotingSessionsController],
  providers: [VotingSessionsService],
  exports: [VotingSessionsService],
})
export class VotingSessionsModule {}
