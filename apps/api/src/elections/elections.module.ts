import { Module } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [ElectionsController],
  providers: [ElectionsService],
  exports: [ElectionsService],
})
export class ElectionsModule {}
