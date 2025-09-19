import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule, 
    AuthModule, 
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true })    // Makes .env variables accessible globally
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
