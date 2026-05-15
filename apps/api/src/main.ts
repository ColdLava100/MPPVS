import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // NOTE: TZ env is intentionally NOT set here. Prisma always communicates in UTC with PostgreSQL.
  // All date comparisons in auth.service.ts operate on UTC Date objects (Strategy B - True UTC).
  // User-facing messages explicitly format to Asia/Kuala_Lumpur via toLocaleString options.

  const port = configService.get<number>('PORT') ?? 3001;
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.enableCors({
    origin: isProduction
      ? [frontendUrl, /\.vercel\.app$/]
      : frontendUrl || 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());

  if (isProduction) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
  }

  await app.listen(port);
}
bootstrap();
