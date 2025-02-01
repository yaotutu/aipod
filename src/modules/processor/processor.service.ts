import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
    ContentMetadata,
    ProcessedContent,
    ProcessingOptions,
    ProcessingResult,
    ProcessingRule
} from './processor.interface';
const readingTime = require('reading-time');

@Injectable()
export class ProcessorService {
    private readonly logger = new Logger(ProcessorService.name);
    private readonly rules: ProcessingRule[] = [];

    constructor() {
        // 注册默认的处理规则
        this.registerDefaultRules();
    }

    /**
     * 注册处理规则
     * @param rule 要注册的处理规则
     */
    registerRule(rule: ProcessingRule) {
        this.rules.push(rule);
    }

    /**
     * 注册默认的处理规则
     */
    private registerDefaultRules() {
        // HTML清理规则
        this.registerRule({
            name: 'htmlCleaner',
            priority: 100,
            condition: (content: string, options: ProcessingOptions) => true,
            process: (content: string, options: ProcessingOptions) => {
                const $ = cheerio.load(content);
                $('script, style').remove();
                if (options.removeImages) {
                    $('img').remove();
                }
                return $.root().html() || content;
            }
        });

        // 链接处理规则
        this.registerRule({
            name: 'linkProcessor',
            priority: 90,
            condition: (content: string, options: ProcessingOptions) => options.extractLinks === true,
            process: (content: string, options: ProcessingOptions) => {
                const $ = cheerio.load(content);
                $('a').each((_, elem) => {
                    const $elem = $(elem);
                    const href = $elem.attr('href');
                    if (href) {
                        $elem.after(` (${href}) `);
                    }
                });
                return $.root().html() || content;
            }
        });

        // 文本提取规则
        this.registerRule({
            name: 'textExtractor',
            priority: 80,
            condition: (content: string, options: ProcessingOptions) => true,
            process: (content: string, options: ProcessingOptions) => {
                const $ = cheerio.load(content);
                let text = $('body').text();
                text = text.replace(/\s+/g, ' ').trim();
                return text;
            }
        });

        // 内容长度限制规则
        this.registerRule({
            name: 'lengthLimiter',
            priority: 70,
            condition: (content: string, options: ProcessingOptions) => !!options.maxLength,
            process: (content: string, options: ProcessingOptions) => {
                if (options.maxLength && content.length > options.maxLength) {
                    return content.slice(0, options.maxLength) + '...';
                }
                return content;
            }
        });
    }

    /**
     * 处理内容
     * @param id 内容ID
     * @param content 原始内容
     * @param options 处理选项
     */
    async processContent(
        id: string,
        content: string,
        options: ProcessingOptions = {}
    ): Promise<ProcessingResult> {
        const startTime = Date.now();

        try {
            this.logger.log('开始处理内容...');
            this.logger.log('原始内容:');
            this.logger.log('----------------------------------------');
            this.logger.log(content);
            this.logger.log('----------------------------------------');

            // 按优先级排序规则
            const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);

            // 依次应用符合条件的规则
            let processedContent = content;
            for (const rule of sortedRules) {
                if (rule.condition(processedContent, options)) {
                    try {
                        this.logger.log(`执行规则: ${rule.name} (优先级: ${rule.priority})`);
                        this.logger.log('处理前内容:');
                        this.logger.log('----------------------------------------');
                        this.logger.log(processedContent);
                        this.logger.log('----------------------------------------');

                        processedContent = rule.process(processedContent, options);

                        this.logger.log('处理后内容:');
                        this.logger.log('----------------------------------------');
                        this.logger.log(processedContent);
                        this.logger.log('----------------------------------------');
                        this.logger.log(`规则 ${rule.name} 处理完成`);
                    } catch (error) {
                        this.logger.warn(`规则 ${rule.name} 处理失败: ${error.message}`);
                    }
                } else {
                    this.logger.log(`跳过规则 ${rule.name} (条件不满足)`);
                }
            }

            const metadata = await this.generateMetadata(processedContent, options);

            this.logger.log('处理完成，最终内容:');
            this.logger.log('----------------------------------------');
            this.logger.log(processedContent);
            this.logger.log('----------------------------------------');
            this.logger.log('元数据:');
            this.logger.log(JSON.stringify(metadata, null, 2));

            const result: ProcessedContent = {
                id,
                originalContent: content,
                cleanContent: processedContent,
                extractedText: processedContent,
                metadata,
                processingDate: new Date(),
            };

            return {
                success: true,
                content: result,
                processingTime: Date.now() - startTime,
            };
        } catch (error) {
            this.logger.error(`处理内容失败: ${error.message}`);
            return {
                success: false,
                error: `处理失败: ${error.message}`,
                processingTime: Date.now() - startTime,
            };
        }
    }

    private async generateMetadata(
        text: string,
        options: ProcessingOptions
    ): Promise<ContentMetadata> {
        const stats = readingTime(text);
        const keyPhrases = this.extractKeyPhrases(text);
        const mainTopics = this.extractTopics(text);
        const quality = this.assessContentQuality(text);

        return {
            wordCount: text.split(/\s+/).length,
            readingTime: Math.ceil(stats.minutes),
            keyPhrases,
            language: 'zh',
            mainTopics,
            contentType: this.detectContentType(text),
            confidence: 0.85,
            quality
        };
    }

    private extractKeyPhrases(text: string): string[] {
        const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const wordFreq = new Map<string, number>();
        words.forEach(word => {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });
        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    private extractTopics(text: string): string[] {
        // TODO: 实现主题提取逻辑
        return [];
    }

    private assessContentQuality(text: string): number {
        const lengthScore = Math.min(text.length / 1000, 1);
        const structureScore = text.split(/\n\s*\n/).length > 3 ? 1 : 0.5;
        const diversityScore = new Set(text.split(/\s+/)).size / text.split(/\s+/).length;
        return (lengthScore + structureScore + diversityScore) / 3;
    }

    private detectContentType(text: string): 'article' | 'news' | 'blog' | 'other' {
        const length = text.length;
        const paragraphs = text.split(/\n\s*\n/).length;

        if (length > 3000 && paragraphs > 5) {
            return 'article';
        } else if (length < 1000) {
            return 'news';
        } else if (paragraphs > 3) {
            return 'blog';
        }
        return 'other';
    }
}