import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  
  const port: string = process.env.BACKEND_PORT || "5554";

  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`Backend server is running on http://localhost:${port}`);

}
bootstrap();
