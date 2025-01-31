import { Module } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { ProcessorModule } from '../processor/processor.module';

@Module({
    imports: [ProcessorModule],
    controllers: [RssController],
    providers: [RssService],
    exports: [RssService],
})
export class RssModule { }