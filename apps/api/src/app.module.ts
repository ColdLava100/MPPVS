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
import { CandidatesModule } from './candidates/candidates.module';
import { VotesModule } from './votes/votes.module';
import { VoterRegistrationsModule } from './voter-registrations/voter-registrations.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        DATABASE_URL: Joi.string().required(),
        DIRECT_URL: Joi.string().optional().default(''),
        FRONTEND_URL: Joi.string().uri().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        TZ: Joi.string().default('Asia/Kuala_Lumpur'),
        SMTP_HOST: Joi.string().optional().default('smtp.gmail.com'),
        SMTP_PORT: Joi.number().optional().default(587),
        SMTP_USER: Joi.string().optional().allow(''),
        SMTP_PASS: Joi.string().optional().allow(''),
        RESEND_API_KEY: Joi.string().optional().allow(''),
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
    CandidatesModule,
    VotesModule,
    VoterRegistrationsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
