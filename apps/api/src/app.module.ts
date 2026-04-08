import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ElectionsModule } from './elections/elections.module';
import { MailModule } from './mail/mail.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { VotingSessionsModule } from './voting-sessions/voting-sessions.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        FRONTEND_URL: Joi.string().uri().required(),
      }),
    }),
    UsersModule,
    AuthModule,
    ElectionsModule,
    MailModule,
    TwoFactorAuthModule,
    AuditLogsModule,
    VotingSessionsModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
