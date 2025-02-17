import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RssModule } from './modules/rss/rss.module';
import { ProcessorModule } from './modules/processor/processor.module';
// import { AiModule } from './modules/ai/ai.module';  // 暂时禁用AI模块

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    RssModule,
    ProcessorModule,
    // AiModule,  // 暂时禁用AI模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
