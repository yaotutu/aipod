export interface ProcessedContent {
    id: string;
    originalContent: string;
    cleanContent: string;
    extractedText: string;
    metadata: ContentMetadata;
    processingDate: Date;
}

export interface ContentMetadata {
    wordCount: number;
    readingTime: number; // 预计阅读时间（分钟）
    keyPhrases: string[];
    language: 'zh' | 'en';  // 修改为必需字段，限制语言类型
    mainTopics: string[];   // 修改为必需字段
    contentType: 'article' | 'news' | 'blog' | 'other';
    confidence?: number;    // 添加处理置信度
    quality?: number;       // 添加内容质量评分
}

export interface ProcessingOptions {
    removeImages?: boolean;
    extractLinks?: boolean;
    detectLanguage?: boolean;
    extractTopics?: boolean;
    maxLength?: number;
}

export interface ProcessingResult {
    success: boolean;
    content?: ProcessedContent;
    error?: string;
    processingTime?: number; // 处理时间（毫秒）
}