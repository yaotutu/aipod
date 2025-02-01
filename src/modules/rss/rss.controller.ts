import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssSource, RssProcessingResult } from './rss.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('rss')
@Controller('rss')
export class RssController {
    constructor(private readonly rssService: RssService) { }

    @Post('sources')
    @ApiOperation({ summary: '添加新的RSS源' })
    @ApiBody({
        description: 'RSS源配置',
        required: true,
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'RSS源名称', example: '阮一峰的网络日志' },
                url: { type: 'string', description: 'RSS源URL', example: 'https://feeds.feedburner.com/ruanyifeng' },
                description: { type: 'string', description: 'RSS源描述', example: '科技爱好者周刊' },
                updateInterval: { type: 'number', description: '更新间隔（分钟）', example: 1440 },
                isActive: { type: 'boolean', description: '是否激活', example: true }
            }
        }
    })
    @ApiResponse({ status: 201, description: '成功添加RSS源' })
    async addSource(
        @Body() source: Omit<RssSource, 'id' | 'lastUpdate'>
    ): Promise<RssSource> {
        return this.rssService.addRssSource(source);
    }

    @Get('sources')
    @ApiOperation({ summary: '获取所有RSS源' })
    @ApiResponse({ status: 200, description: '返回RSS源列表' })
    async getSources(): Promise<RssSource[]> {
        return this.rssService.getRssSources();
    }

    @Post('sources/test')
    @ApiOperation({ summary: '测试RSS源可用性' })
    @ApiBody({
        description: 'RSS源URL',
        required: true,
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'RSS源URL',
                    example: 'https://feeds.feedburner.com/ruanyifeng'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: '测试结果' })
    async testSource(
        @Body('url') url: string
    ): Promise<RssProcessingResult> {
        return this.rssService.testRssSource(url);
    }

    @Post('sources/:id/process')
    @ApiOperation({ summary: '处理指定的RSS源' })
    @ApiParam({ name: 'id', description: 'RSS源ID' })
    @ApiResponse({ status: 200, description: '处理结果' })
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