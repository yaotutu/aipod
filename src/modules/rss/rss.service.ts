import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as Parser from 'rss-parser';
import { ProcessingOptions } from '../processor/processor.interface';
import { ProcessorService } from '../processor/processor.service';
import { RssItem, RssProcessingResult, RssSource } from './rss.interface';

@Injectable()
export class RssService {
    private readonly logger = new Logger(RssService.name);
    private readonly parser: Parser;
    private readonly sources: RssSource[] = [
        {
            id: 'ruanyf-weekly',
            name: '阮一峰的周刊',
            url: 'https://feeds.feedburner.com/ruanyifeng',
            description: '科技爱好者周刊，每周分享科技见闻、编程技巧、工具资源',
            updateInterval: 60 * 24, // 每天检查一次
            isActive: true,
            lastUpdate: new Date()
        },
        {
            id: 'guanguans-robot',
            name: 'GuanGuans Robot',
            url: 'https://guanguans.cn/feed',
            description: '编程、开源、技术分享',
            updateInterval: 60 * 12, // 每12小时检查一次
            isActive: true,
            lastUpdate: new Date()
        }
    ]; // TODO: 将来从数据库获取

    constructor(private readonly processorService: ProcessorService) {
        this.parser = new Parser({
            customFields: {
                item: ['content:encoded', 'content'],
            },
        });
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        this.logger.log('开始处理RSS源更新...');
        for (const source of this.sources) {
            if (source.isActive) {
                try {
                    await this.processRssSource(source);
                } catch (error) {
                    this.logger.error(`处理RSS源 ${source.name} 失败: ${error.message}`);
                }
            }
        }
    }

    async processRssSource(source: RssSource): Promise<RssProcessingResult> {
        try {
            this.logger.log(`开始处理RSS源: ${source.name} (${source.url})`);
            const response = await axios.get(source.url);
            const feed = await this.parser.parseString(response.data);
            // 测试数据,只保留feed中的items的前两条数据
            feed.items = feed.items.slice(0, 1);
            this.logger.log(`成功获取RSS源数据，共 ${feed.items.length} 条内容`);

            const items: RssItem[] = await Promise.all(
                feed.items
                    .filter(item => item.title && (item.link || item.guid))
                    .map(async (item, index) => {
                        this.logger.log(`\n处理第 ${index + 1}/${feed.items.length} 条内容`);
                        this.logger.log(`标题: ${item.title}`);

                        const uniqueId = this.generateId(
                            [item.guid, item.link, item.title]
                                .filter((val): val is string => !!val)[0]
                        );

                        const content = item['content:encoded'] ||
                            item.content ||
                            item.description ||
                            '无内容';

                        // 使用处理器服务处理内容
                        const processingOptions: ProcessingOptions = {
                            removeImages: true,
                            extractLinks: true,
                            detectLanguage: true,
                            extractTopics: true,
                            maxLength: 5000 // 限制内容长度
                        };

                        this.logger.log('开始内容处理...');
                        // 使用处理器链处理内容
                        const processedResult = await this.processorService.processContent(
                            uniqueId,
                            content,
                            processingOptions
                        );

                        if (processedResult.success) {
                            this.logger.log('内容处理成功');
                            this.logger.log(`处理时间: ${processedResult.processingTime}ms`);
                            if (processedResult.content?.metadata) {
                                const metadata = processedResult.content.metadata;
                                this.logger.log('内容分析结果:');
                                this.logger.log(`- 字数: ${metadata.wordCount}`);
                                this.logger.log(`- 预计阅读时间: ${metadata.readingTime}分钟`);
                                this.logger.log(`- 内容类型: ${metadata.contentType}`);
                                this.logger.log(`- 质量评分: ${metadata.quality}`);
                                this.logger.log(`- 关键短语: ${metadata.keyPhrases.join(', ')}`);
                            }
                        } else {
                            this.logger.warn(`内容处理失败: ${processedResult.error}`);
                        }

                        return {
                            id: uniqueId,
                            title: item.title!,
                            content: processedResult.success ? processedResult.content!.cleanContent : content,
                            link: item.link || item.guid || '',
                            pubDate: new Date(item.pubDate || new Date()),
                            author: item.creator || item.author || '未知作者',
                            categories: item.categories || [],
                            sourceId: source.id,
                            processed: processedResult.success,
                            summary: processedResult.success ?
                                processedResult.content!.extractedText :
                                undefined,
                        };
                    })
            );

            this.logger.log(`\n处理完成，成功处理 ${items.length} 条内容`);
            // TODO: 保存到数据库

            return {
                success: true,
                itemsProcessed: items.length,
                message: `成功处理 ${source.name} 的RSS源`,
            };
        } catch (error) {
            this.logger.error(`处理RSS源失败: ${error.message}`);
            return {
                success: false,
                itemsProcessed: 0,
                message: `处理失败: ${error.message}`,
                errors: [error.message],
            };
        }
    }

    async addRssSource(source: Omit<RssSource, 'id'>): Promise<RssSource> {
        const newSource: RssSource = {
            ...source,
            id: this.generateId(source.url),
            lastUpdate: new Date(),
        };
        this.sources.push(newSource);
        return newSource;
    }

    private generateId(str: string): string {
        return Buffer.from(str).toString('base64').slice(0, 12);
    }

    async getRssSources(): Promise<RssSource[]> {
        return this.sources;
    }

    async testRssSource(url: string): Promise<RssProcessingResult> {
        try {
            const response = await axios.get(url);
            const feed = await this.parser.parseString(response.data);
            return {
                success: true,
                itemsProcessed: feed.items.length,
                message: `成功测试RSS源：${feed.title || 'Untitled Feed'}`,
            };
        } catch (error) {
            return {
                success: false,
                itemsProcessed: 0,
                message: `测试失败: ${error.message}`,
                errors: [error.message],
            };
        }
    }
}