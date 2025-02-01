import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
const readingTime = require('reading-time');
import {
    ProcessedContent,
    ProcessingOptions,
    ProcessingResult,
    ContentMetadata,
} from './processor.interface';

@Injectable()
export class ProcessorService {
    private readonly logger = new Logger(ProcessorService.name);

    async processContent(
        id: string,
        content: string,
        options: ProcessingOptions = {}
    ): Promise<ProcessingResult> {
        const startTime = Date.now();

        try {
            const cleanContent = this.cleanHtml(content, options);
            const extractedText = this.extractText(cleanContent);

            if (!extractedText.trim()) {
                return {
                    success: false,
                    error: '提取的文本内容为空',
                    processingTime: Date.now() - startTime,
                };
            }

            const metadata = await this.generateMetadata(extractedText, options);

            const processedContent: ProcessedContent = {
                id,
                originalContent: content,
                cleanContent,
                extractedText,
                metadata,
                processingDate: new Date(),
            };

            return {
                success: true,
                content: processedContent,
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

    private cleanHtml(content: string, options: ProcessingOptions): string {
        const $ = cheerio.load(content);

        // 移除脚本和样式标签
        $('script, style').remove();

        // 根据选项移除图片标签
        if (options.removeImages) {
            $('img').remove();
        }

        // 处理链接
        if (options.extractLinks) {
            $('a').each((_, elem) => {
                const $elem = $(elem);
                const href = $elem.attr('href');
                if (href) {
                    $elem.after(` (${href}) `);
                }
            });
        }

        // 规范化空白字符
        const html = $.root().html();
        return html ? html.replace(/\s+/g, ' ').trim() : '';
    }

    private extractText(html: string): string {
        const $ = cheerio.load(html);

        // 提取所有文本内容
        let text = $('body').text();

        // 清理和规范化文本
        text = text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();

        return text;
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
            language: 'zh', // 默认使用中文
            mainTopics,     // 总是提供主题
            contentType: this.detectContentType(text),
            confidence: 0.85,
            quality
        };
    }

    private assessContentQuality(text: string): number {
        // 基于多个维度评估内容质量
        const lengthScore = Math.min(text.length / 1000, 1); // 长度评分
        const structureScore = text.split(/\n\s*\n/).length > 3 ? 1 : 0.5; // 结构评分
        const diversityScore = new Set(text.split(/\s+/)).size / text.split(/\s+/).length; // 词汇丰富度

        return (lengthScore + structureScore + diversityScore) / 3;
    }

    private extractKeyPhrases(text: string): string[] {
        // 简单的关键词提取实现
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

    private extractTopics(text: string): string[] {
        // TODO: 实现更复杂的主题提取算法
        // 当前使用简单的频率分析
        return this.extractKeyPhrases(text);
    }
}