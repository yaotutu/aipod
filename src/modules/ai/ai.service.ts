import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
    AIModelConfig,
    ContentSummaryRequest,
    ContentSummaryResult,
    AIProcessingResult,
    SummaryOptions,
    PromptTemplate,
    OPENAI_MODELS,
    AIServiceConfig
} from './ai.interface';

@Injectable()
export class AiService implements OnModuleInit {
    private readonly logger = new Logger(AiService.name);
    private readonly openai: OpenAI;
    private readonly defaultModel: string = OPENAI_MODELS.GPT_3_5_TURBO;
    private readonly defaultPrompts: PromptTemplate[] = [
        {
            name: 'summary',
            template: `请对以下内容进行摘要总结。
标题：{{title}}
内容：{{content}}
要求：
1. 保持要点清晰
2. 使用{{language}}语言
3. 总结长度控制在{{maxLength}}字以内
4. 格式：{{format}}`,
            variables: ['title', 'content', 'language', 'maxLength', 'format'],
            defaultOptions: {
                maxLength: 300,
                format: 'detailed',
                language: 'zh',
            },
        },
        {
            name: 'key-points',
            template: `请从以下内容中提取关键观点，以要点形式列出。
标题：{{title}}
内容：{{content}}
要求：
1. 每个要点应该简洁明了
2. 使用{{language}}语言
3. 提取{{pointCount}}个关键要点`,
            variables: ['title', 'content', 'language', 'pointCount'],
            defaultOptions: {
                pointCount: 5,
                language: 'zh',
            },
        },
    ];

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.getOrThrow('OPENAI_API_KEY') as string;
        this.openai = new OpenAI({
            apiKey,
        });
    }

    async onModuleInit() {
        try {
            this.configService.getOrThrow('OPENAI_API_KEY');
        } catch (error) {
            this.logger.error('未设置OpenAI API密钥！');
            throw new Error('Missing OpenAI API key');
        }
    }

    async summarizeContent(
        request: ContentSummaryRequest
    ): Promise<AIProcessingResult> {
        const startTime = Date.now();
        const options: SummaryOptions = {
            maxLength: request.options?.maxLength || 300,
            format: request.options?.format || 'detailed',
            language: request.options?.language || 'zh',
            includeTags: true,  // 默认总是包含标签
            includeTopics: true, // 默认总是包含主题
        };

        try {
            // 生成内容摘要
            const summaryPrompt = this.generatePrompt('summary', {
                title: request.title,
                content: request.content,
                language: options.language,
                maxLength: options.maxLength,
                format: options.format,
            });

            const summaryResult = await this.callOpenAI(summaryPrompt);

            // 生成关键要点
            const keyPointsPrompt = this.generatePrompt('key-points', {
                title: request.title,
                content: request.content,
                language: options.language,
                pointCount: 5,
            });

            const keyPointsResult = await this.callOpenAI(keyPointsPrompt);

            // 解析关键要点
            const keyPoints = keyPointsResult
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(point => point.replace(/^[•\-\d\.\s]+/, '').trim());

            // 生成标签和主题
            const tagsAndTopics = await this.generateTagsAndTopics(request);

            const result: ContentSummaryResult = {
                id: request.id,
                originalTitle: request.title,
                summary: summaryResult,
                keyPoints,
                tags: tagsAndTopics.tags,
                topics: tagsAndTopics.topics,
                language: options.language || 'zh',
                tokenCount: this.estimateTokenCount(summaryResult),
                processingTime: Date.now() - startTime,
                sourceType: this.detectSourceType(request.content),
                confidence: 0.85, // 添加默认置信度
            };

            return {
                success: true,
                result,
            };
        } catch (error) {
            this.logger.error(`AI处理失败: ${error.message}`);
            return {
                success: false,
                error: `处理失败: ${error.message}`,
            };
        }
    }

    private getModelName(): string {
        const modelName = this.configService.get('OPENAI_API_MODEL');
        return modelName || this.defaultModel;
    }

    private async callOpenAI(prompt: string): Promise<string> {
        const model = this.getModelName();

        try {
            const response = await this.openai.chat.completions.create({
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000,
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content in response');
            }

            return content;
        } catch (error) {
            this.logger.error(`OpenAI API调用失败: ${error.message}`);
            throw new Error(`AI处理失败: ${error.message}`);
        }
    }

    private generatePrompt(templateName: string, variables: Record<string, any>): string {
        const template = this.defaultPrompts.find(t => t.name === templateName);
        if (!template) {
            throw new Error(`未找到模板: ${templateName}`);
        }

        let prompt = template.template;
        for (const [key, value] of Object.entries(variables)) {
            prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        return prompt;
    }

    private async generateTagsAndTopics(
        request: ContentSummaryRequest
    ): Promise<{ tags: string[]; topics: string[] }> {
        const prompt = `请从以下内容中提取标签和主题。
标题：${request.title}
内容：${request.content}
要求：
1. 提供5个相关标签
2. 提供3个主要主题
请以JSON格式返回结果：
{
  "tags": ["标签1", "标签2", ...],
  "topics": ["主题1", "主题2", ...]
}`;

        try {
            const result = await this.callOpenAI(prompt);
            const parsed = JSON.parse(result);
            return {
                tags: parsed.tags || [],
                topics: parsed.topics || [],
            };
        } catch (error) {
            this.logger.warn(`生成标签和主题失败: ${error.message}`);
            return {
                tags: [],
                topics: [],
            };
        }
    }

    private detectSourceType(content: string): 'article' | 'news' | 'blog' {
        const length = content.length;
        const paragraphs = content.split(/\n\s*\n/).length;

        if (length > 3000 && paragraphs > 5) {
            return 'article';
        } else if (length < 1000) {
            return 'news';
        }
        return 'blog';
    }

    private estimateTokenCount(text: string): number {
        // 简单估算：中文每字算1个token，英文每4个字符算1个token
        const chineseRegex = /[\u4e00-\u9fa5]/g;
        const chineseLength = (text.match(chineseRegex) || []).length;
        const nonChineseText = text.replace(chineseRegex, '');
        const englishLength = Math.ceil(nonChineseText.length / 4);
        return chineseLength + englishLength;
    }
}