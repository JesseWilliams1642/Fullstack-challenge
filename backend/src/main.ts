import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  const port: string = process.env.BACKEND_PORT || "5554";

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true                           // Removes any elements not defined
  }));                                        // in an expected request @Body type
  await app.listen(port);
  console.log(`Backend server is running on http://localhost:${port}`);

}
bootstrap();
