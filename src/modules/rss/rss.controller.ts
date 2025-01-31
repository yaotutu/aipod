import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssSource, RssProcessingResult } from './rss.interface';

@Controller('rss')
export class RssController {
    constructor(private readonly rssService: RssService) { }

    @Post('sources')
    async addSource(
        @Body() source: Omit<RssSource, 'id' | 'lastUpdate'>
    ): Promise<RssSource> {
        return this.rssService.addRssSource(source);
    }

    @Get('sources')
    async getSources(): Promise<RssSource[]> {
        return this.rssService.getRssSources();
    }

    @Post('sources/test')
    async testSource(
        @Body('url') url: string
    ): Promise<RssProcessingResult> {
        return this.rssService.testRssSource(url);
    }

    @Post('sources/:id/process')
    async processSource(
        @Param('id') id: string
    ): Promise<RssProcessingResult> {
        const source = (await this.rssService.getRssSources()).find(s => s.id === id);
        if (!source) {
            return {
                success: false,
                itemsProcessed: 0,
                message: 'RSS源未找到',
                errors: ['Invalid source ID'],
            };
        }
        return this.rssService.processRssSource(source);
    }
}