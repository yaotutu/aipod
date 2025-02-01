import { Controller, Post, Body } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { ProcessingOptions, ProcessingResult } from './processor.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('processor')
@Controller('processor')
export class ProcessorController {
    constructor(private readonly processorService: ProcessorService) { }

    @Post('process')
    @ApiOperation({ summary: '处理内容' })
    @ApiBody({
        description: '需要处理的内容和选项',
        required: true,
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: '内容ID', example: 'article-001' },
                content: {
                    type: 'string',
                    description: '要处理的原始内容',
                    example: '<p>这是一篇测试文章，包含了<a href="https://example.com">一些链接</a>和<img src="image.jpg" />图片。</p>'
                },
                options: {
                    type: 'object',
                    description: '处理选项',
                    properties: {
                        removeImages: { type: 'boolean', description: '是否移除图片', example: true },
                        extractLinks: { type: 'boolean', description: '是否提取链接', example: true },
                        detectLanguage: { type: 'boolean', description: '是否检测语言', example: true },
                        extractTopics: { type: 'boolean', description: '是否提取主题', example: true },
                        maxLength: { type: 'number', description: '最大长度限制', example: 1000 }
                    }
                }
            },
            required: ['id', 'content']
        }
    })
    @ApiResponse({
        status: 200,
        description: '内容处理结果',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: '处理是否成功' },
                content: {
                    type: 'object',
                    description: '处理后的内容',
                    properties: {
                        id: { type: 'string' },
                        cleanContent: { type: 'string' },
                        extractedText: { type: 'string' },
                        metadata: { type: 'object' }
                    }
                },
                error: { type: 'string', description: '错误信息' },
                processingTime: { type: 'number', description: '处理时间(ms)' }
            }
        }
    })
    async processContent(
        @Body() body: {
            id: string;
            content: string;
            options?: ProcessingOptions;
        }
    ): Promise<ProcessingResult> {
        return this.processorService.processContent(
            body.id,
            body.content,
            body.options
        );
    }
}