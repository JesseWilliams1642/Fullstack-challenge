import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);
  const port: string | number = configService.get<number>("BACKEND_PORT") || 5554;  
  
  await app.listen(port);
  console.log(`Backend server is running on http://localhost:${port}`);

}
bootstrap();
